package com.wemeetdesk.smartledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SmartLedgerApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartLedgerApplication.class, args);
    }
}
