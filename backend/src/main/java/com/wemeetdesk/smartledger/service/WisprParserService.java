package com.wemeetdesk.smartledger.service;

import com.wemeetdesk.smartledger.model.Product;
import com.wemeetdesk.smartledger.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class WisprParserService {
    private final ProductRepository productRepository;

    private static final Map<String, String> NUMBER_WORDS = new LinkedHashMap<>() {{
        put("ek", "1"); put("एक", "1"); put("one", "1");
        put("do", "2"); put("दो", "2"); put("two", "2");
        put("teen", "3"); put("तीन", "3"); put("three", "3");
        put("char", "4"); put("चार", "4"); put("four", "4");
        put("paanch", "5"); put("panch", "5"); put("पांच", "5"); put("five", "5");
        put("chhah", "6"); put("छह", "6"); put("six", "6");
        put("saat", "7"); put("सात", "7"); put("seven", "7");
        put("aath", "8"); put("आठ", "8"); put("eight", "8");
        put("nau", "9"); put("नौ", "9"); put("nine", "9");
        put("dus", "10"); put("das", "10"); put("दस", "10"); put("ten", "10");
        put("adhha", "0.5"); put("aadha", "0.5"); put("आधा", "0.5"); put("half", "0.5");
    }};

    private static final Map<String, String> UNITS = new LinkedHashMap<>() {{
        put("kg", "kg"); put("kgs", "kg"); put("kilo", "kg"); put("kilos", "kg"); put("किलो", "kg");
        put("kilogram", "kg"); put("kilograms", "kg");
        put("g", "g"); put("gm", "g"); put("gram", "g"); put("grams", "g"); put("ग्राम", "g");
        put("l", "L"); put("litre", "L"); put("litres", "L"); put("liter", "L"); put("liters", "L"); put("लीटर", "L");
        put("ml", "ml"); put("मिली", "ml");
        put("pc", "pcs"); put("pcs", "pcs"); put("piece", "pcs"); put("pieces", "pcs"); put("पीस", "pcs");
        put("dozen", "dozen"); put("दर्जन", "dozen");
        put("packet", "packets"); put("packets", "packets"); put("पैकेट", "packets");
        put("bottle", "bottles"); put("bottles", "bottles");
        put("bag", "bags"); put("bags", "bags");
        put("box", "boxes"); put("boxes", "boxes");
        put("sachet", "sachets"); put("sachets", "sachets");
        put("meter", "meters"); put("meters", "meters"); put("metre", "meters"); put("metres", "meters");
        put("feet", "feet");
    }};

    private static final String NUM = "(\\d+(?:\\.\\d+)?)";
    private static final String UNIT_ALT;
    private static final Pattern SPLIT = Pattern.compile(
            "[,;\\n]+|(?<=\\s|^)[-–—•*]+(?=\\s)|(?<![\\p{L}\\p{M}\\p{N}])(?:and|aur|और|then|plus|also|&)(?![\\p{L}\\p{M}\\p{N}])");
    private static final Pattern LEAD = Pattern.compile(
            "^(?:(?:please\\s+)?(?:give|add|sell|bill|need|want|i want|dena|de do|do)\\s+)+");
    private static final Pattern PRICE_TAIL = Pattern.compile(
            "\\s+(?:at|for|@|rate|price)\\s*(?:rs\\.?|rupees|₹)?\\s*" + NUM + "(?:\\s*(?:rs|rupees|rupaye|₹)\\b)?(?:\\s*(?:each|per\\s+\\w+|/\\w+))?$");
    private static final Pattern QTY_FIRST;
    private static final Pattern NAME_FIRST;
    /** "2 kg rice 1 kg sugar" with no separator: a new quantity+unit starts the next item. */
    private static final Pattern RUNS;

    static {
        StringBuilder sb = new StringBuilder();
        UNITS.keySet().stream()
                .sorted((a, b) -> b.length() - a.length())
                .forEach(u -> sb.append(sb.length() == 0 ? "" : "|").append(Pattern.quote(u)));
        UNIT_ALT = sb.toString();
        // Leading filler ("give me", "I want") is skipped; the quantity can sit anywhere before the name.
        QTY_FIRST = Pattern.compile("^(?:.*?[^\\p{L}\\p{M}\\p{N}.])?" + NUM + "\\s*(" + UNIT_ALT + ")?(?![\\p{L}\\p{M}])\\s*(?:of\\s+)?([\\p{L}][\\p{L}\\p{M} ]*)$");
        NAME_FIRST = Pattern.compile("^([\\p{L}][\\p{L}\\p{M} ]*?)\\s+" + NUM + "\\s*(" + UNIT_ALT + ")?$");
        RUNS = Pattern.compile("(?<=[\\p{L}\\p{M}])\\s+(?=" + NUM + "\\s*(?:" + UNIT_ALT + ")(?![\\p{L}\\p{M}]))");
    }

    public record ParsedItem(String name, BigDecimal quantity, String unit, BigDecimal price, boolean priceFromSheet) {}

    /**
     * A clean sentence for display: no colons, commas, bullets, quotes, brackets, stray full stops
     * or filler sounds. Decimal points survive. Parsing still runs on the raw text, where commas
     * and bullets are useful item separators.
     */
    public static String cleanTranscript(String text) {
        if (text == null) return "";
        return text
                .replaceAll("[\\u200B-\\u200D\\uFEFF]", "")
                .replaceAll("\\p{So}|\\p{Cs}", " ")
                .replaceAll("(?<=\\s|^)[-–—•*·]+(?=\\s|$)", " ")
                .replaceAll("[:;,|\"“”‘’`~^()\\[\\]{}<>_=\\\\]", " ")
                .replaceAll("(?<!\\d)\\.|\\.(?!\\d)", " ")
                .replaceAll("[?!।]+", " ")
                .replaceAll("(?i)(?<![\\p{L}\\p{M}])(?:um+|uh+|hmm+|erm)(?![\\p{L}\\p{M}])", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public List<ParsedItem> parse(String text, String userId) {
        if (text == null || text.isBlank()) return List.of();
        String normalized = normalize(text.toLowerCase());
        List<Product> products = productRepository.findAllByUserId(userId);
        List<ParsedItem> items = new ArrayList<>();
        for (String chunk : SPLIT.split(normalized)) {
            String c = chunk.trim().replaceAll("\\s+", " ");
            // Only quantity-first runs are split; "sugar 2 kg" must stay one item.
            String[] parts = c.matches("^\\d.*") ? RUNS.split(c) : new String[]{c};
            for (String part : parts) {
                ParsedItem item = parsePart(part.trim(), products);
                if (item != null) items.add(item);
            }
        }
        return items;
    }

    /** Whole-word replacement only, so "dozen" is never read as "do" + "zen". */
    private String normalize(String text) {
        // Speech-to-text adds sentence punctuation; keep only decimal points.
        String t = text
                .replaceAll("(?<!\\d)\\.|\\.(?!\\d)|[?!।\"'“”‘’()]", " ")
                .replace("₹", " rs ")
                .replace("१", "1").replace("२", "2").replace("३", "3").replace("४", "4").replace("५", "5")
                .replace("६", "6").replace("७", "7").replace("८", "8").replace("९", "9").replace("०", "0");
        for (Map.Entry<String, String> e : NUMBER_WORDS.entrySet()) {
            t = t.replaceAll("(?<![\\p{L}\\p{M}\\p{N}])" + Pattern.quote(e.getKey()) + "(?![\\p{L}\\p{M}\\p{N}])", e.getValue());
        }
        return t;
    }

    private ParsedItem parsePart(String raw, List<Product> products) {
        if (raw.isBlank()) return null;
        String part = LEAD.matcher(raw).replaceFirst("").trim();
        BigDecimal spokenPrice = null;
        Matcher pm = PRICE_TAIL.matcher(part);
        if (pm.find()) {
            spokenPrice = new BigDecimal(pm.group(1));
            part = part.substring(0, pm.start()).trim();
        }

        String name;
        BigDecimal qty;
        String unitWord;
        Matcher m = NAME_FIRST.matcher(part);
        if (m.matches()) {
            name = m.group(1);
            qty = new BigDecimal(m.group(2));
            unitWord = m.group(3);
        } else {
            m = QTY_FIRST.matcher(part);
            if (!m.matches()) return null;
            qty = new BigDecimal(m.group(1));
            unitWord = m.group(2);
            name = m.group(3);
        }
        name = name.replaceAll("^(?:of|some|the)\\s+", "").replaceAll("\\s+(?:please|only)$", "").trim();
        if (name.isBlank() || qty.signum() <= 0) return null;

        Product prod = findProduct(products, name);
        String unit = unitWord != null ? UNITS.getOrDefault(unitWord, unitWord) : (prod != null ? prod.getUnit() : "pcs");
        String displayName = prod != null ? prod.getName() : capitalize(name);

        if (spokenPrice != null) return new ParsedItem(displayName, qty, unit, spokenPrice, false);
        if (prod != null && prod.getDefaultSellingPrice() != null) {
            return new ParsedItem(displayName, qty, unit, prod.getDefaultSellingPrice(), true);
        }
        // Not on the price sheet: keep the line at price 0 so the shopkeeper can fill it in.
        return new ParsedItem(displayName, qty, unit, BigDecimal.ZERO, false);
    }

    private String capitalize(String s) {
        return s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private Product findProduct(List<Product> products, String name) {
        String lower = name.toLowerCase().trim();
        for (Product p : products) {
            if (p.getName().toLowerCase().equals(lower)) return p;
        }
        for (Product p : products) {
            String pn = p.getName().toLowerCase();
            if (pn.contains(lower) || lower.contains(pn)) return p;
        }
        return null;
    }
}
