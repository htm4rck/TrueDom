package com.alicorp.truedom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TrueDomApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrueDomApplication.class, args);
    }
}
