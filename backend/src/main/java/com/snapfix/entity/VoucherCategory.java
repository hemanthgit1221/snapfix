package com.snapfix.entity;

public enum VoucherCategory {
    FOOD("Food & Dining"),
    EDUCATION("Education & Books"),
    SERVICES("Campus Services"),
    FITNESS("Fitness & Sports"),
    ENTERTAINMENT("Entertainment"),
    TRANSPORT("Transportation"),
    SHOPPING("Shopping"),
    HEALTH("Health & Wellness"),
    TECHNOLOGY("Technology"),
    OTHER("Other");

    private final String displayName;

    VoucherCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
