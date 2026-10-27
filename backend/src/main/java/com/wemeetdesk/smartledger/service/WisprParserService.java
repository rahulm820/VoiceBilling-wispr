package com.wemeetdesk.smartledger.service;

import com.wemeetdesk.smartledger.dto.ProductDtos;
import com.wemeetdesk.smartledger.model.Product;
import com.wemeetdesk.smartledger.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class WisprParserService {
    private final ProductRepository productRepository;

    private static final Map<String, String> HINDI_NUM = new HashMap<>() {{
        put("ek", "1"); put("एक", "1");
        put("do", "2"); put("दो", "2");
        put("teen", "3"); put("तीन", "3");
        put("char", "4"); put("चार", "4");
        put("paanch", "5"); put("पांच", "5");
        put("chhah", "6"); put("छह", "6");
        put("saat", "7"); put("सात", "7");
        put("aath", "8"); put("आठ", "8");
        put("nau", "9"); put("नौ", "9");
        put("dus", "10"); put("दस", "10");
        put("adhha", "0.5"); put("आधा", "0.5");
    }};

    private static final Map<String, String> HINDI_UNIT = new HashMap<>() {{
        put("kilo", "kg"); put("kilos", "kg"); put("किलो", "kg");
        put("kilogram", "kg"); put("kilograms", "kg");
        put("gram", "g"); put("grams", "g"); put("ग्राम", "g");
        put("litre", "L"); put("litres", "L"); put("लीटर", "L"); put("liter", "L");
        put("ml", "ml"); put("मिली", "ml");
        put("piece", "pcs"); put("pieces", "pcs"); put("पीस", "pcs");
        put("dozen", "dozen"); put("दर्जन", "dozen");
        put("packet", "packets"); put("packets", "packets"); put("पैकेट", "packets");
        put("bottle", "bottles"); put("bottles", "bottles");
        put("bag", "bags"); put("bags", "bags");
        put("box", "boxes"); put("boxes", "boxes");
        put("sachet", "sachets"); put("sachets", "sachets");
        put("meter", "meters"); put("metre", "meters"); put("feet", "feet");
    }};

    public record ParsedItem(String name, BigDecimal quantity, String unit, BigDecimal price, boolean priceFromSheet) {}

    public List<ParsedItem> parse(String text, String userId) {
        if (text == null || text.isBlank()) return List.of();
        String normalized = normalizeHindi(text.toLowerCase());
        List<ParsedItem> items = new ArrayList<>();
        String[] parts = normalized.split("[,;\\n]+");
        for (String part : parts) {
            ParsedItem item = parsePart(part.trim(), userId);
            if (item != null) items.add(item);
        }
        return items;
    }

    private String normalizeHindi(String text) {
        String t = text;
        for (Map.Entry<String, String> e : HINDI_NUM.entrySet()) {
            t = t.replace(e.getKey(), e.getValue());
        }
        for (Map.Entry<String, String> e : HINDI_UNIT.entrySet()) {
            t = t.replace(e.getKey(), e.getValue());
        }
        // digits
        t = t.replace("१", "1").replace("२", "2").replace("३", "3").replace("४", "4").replace("५", "5")
                .replace("६", "6").replace("७", "7").replace("८", "8").replace("९", "9").replace("०", "0");
        return t;
    }

    private ParsedItem parsePart(String part, String userId) {
        if (part.isBlank()) return null;
        // try to find quantity, unit, price
        Pattern p1 = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(kg|g|l|ml|pcs|dozen|packets|bottles|bags|litres|sachets|boxes|meters|feet)\\s+([a-zA-Z ]+?)(?:\\s+at\\s+(\\d+(?:\\.\\d+)?))?");
        Matcher m1 = p1.matcher(part);
        if (m1.find()) {
            String qtyStr = m1.group(1);
            String unit = normalizeUnit(m1.group(2));
            String name = cleanName(m1.group(3));
            String priceStr = m1.group(4);
            BigDecimal qty = new BigDecimal(qtyStr);
            Product prod = findProduct(userId, name);
            if (priceStr != null) {
                return new ParsedItem(prod == null ? name : prod.getName(), qty, unit, new BigDecimal(priceStr), false);
            }
            if (prod != null && prod.getDefaultSellingPrice() != null) {
                return new ParsedItem(prod.getName(), qty, unit, prod.getDefaultSellingPrice(), true);
            }
            return null;
        }
        Pattern p2 = Pattern.compile("([a-zA-Z ]+?)\\s+(\\d+(?:\\.\\d+)?)\\s*(kg|g|l|ml|pcs|dozen|packets|bottles|bags|litres|sachets|boxes|meters|feet)(?:\\s+(\\d+(?:\\.\\d+)?))?");
        Matcher m2 = p2.matcher(part);
        if (m2.find()) {
            String name = cleanName(m2.group(1));
            String qtyStr = m2.group(2);
            String unit = normalizeUnit(m2.group(3));
            String priceStr = m2.group(4);
            BigDecimal qty = new BigDecimal(qtyStr);
            Product prod = findProduct(userId, name);
            if (priceStr != null) {
                return new ParsedItem(prod == null ? name : prod.getName(), qty, unit, new BigDecimal(priceStr), false);
            }
            if (prod != null && prod.getDefaultSellingPrice() != null) {
                return new ParsedItem(prod.getName(), qty, unit, prod.getDefaultSellingPrice(), true);
            }
            return null;
        }
        return null;
    }

    private String normalizeUnit(String u) {
        if (u.equals("litres") || u.equals("liter") || u.equals("litre")) return "L";
        if (u.equals("kilogram") || u.equals("kilograms") || u.equals("kilo")) return "kg";
        if (u.equals("grams")) return "g";
        if (u.equals("pieces")) return "pcs";
        if (u.equals("packets")) return "packets";
        if (u.equals("bottles")) return "bottles";
        if (u.equals("bags")) return "bags";
        if (u.equals("boxes")) return "boxes";
        if (u.equals("sachets")) return "sachets";
        if (u.equals("meters")) return "meters";
        if (u.equals("feet")) return "feet";
        if (u.equals("dozen")) return "dozen";
        return u.toUpperCase().equals("L") ? "L" : u;
    }

    private String cleanName(String name) {
        if (name == null) return "";
        String n = name.replace("at", "").replace("rupees", "").replace("rs", "").trim();
        return n;
    }

    private Product findProduct(String userId, String name) {
        List<Product> products = productRepository.findAllByUserId(userId);
        String lower = name.toLowerCase().trim();
        for (Product p : products) {
            if (p.getName().toLowerCase().equals(lower)) return p;
            if (p.getName().toLowerCase().contains(lower) || lower.contains(p.getName().toLowerCase())) return p;
        }
        return null;
    }
}
