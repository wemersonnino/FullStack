package com.escala.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

@SpringBootApplication
public class AuthServiceApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(AuthServiceApplication.class, args);
	}

	private static void loadEnv() {
		File envFile = new File(".env");
		if (envFile.exists()) {
			try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
				String line;
				while ((line = reader.readLine()) != null) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int eqIndex = line.indexOf('=');
					if (eqIndex > 0) {
						String key = line.substring(0, eqIndex).trim();
						String value = line.substring(eqIndex + 1).trim();
						if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
							value = value.substring(1, value.length() - 1);
						}
						System.setProperty(key, value);
					}
				}
			} catch (Exception e) {
				System.err.println("Erro ao carregar o arquivo .env: " + e.getMessage());
			}
		}
	}
}
