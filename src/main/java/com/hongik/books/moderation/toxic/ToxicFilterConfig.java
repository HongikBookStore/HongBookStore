package com.hongik.books.moderation.toxic;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ToxicFilterProperties.class)
public class ToxicFilterConfig { }

