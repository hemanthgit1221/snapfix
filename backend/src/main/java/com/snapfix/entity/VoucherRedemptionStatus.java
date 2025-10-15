package com.snapfix.entity;

public enum VoucherRedemptionStatus {
    ACTIVE("Active"),
    USED("Used"),
    EXPIRED("Expired"),
    CANCELLED("Cancelled");

    private final String displayName;

    VoucherRedemptionStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
