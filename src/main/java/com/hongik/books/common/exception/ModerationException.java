package com.hongik.books.common.exception;

public class ModerationException extends RuntimeException {
    private final String field;
    private final String predictionLevel;
    private final Double malicious;
    private final Double clean;
    private final String reason; // disabled | blank | unavailable | error | null

    public ModerationException(String message, String field, String predictionLevel, Double malicious, Double clean, String reason) {
        super(message);
        this.field = field;
        this.predictionLevel = predictionLevel;
        this.malicious = malicious;
        this.clean = clean;
        this.reason = reason;
    }

    public String getField() { return field; }
    public String getPredictionLevel() { return predictionLevel; }
    public Double getMalicious() { return malicious; }
    public Double getClean() { return clean; }
    public String getReason() { return reason; }
}

