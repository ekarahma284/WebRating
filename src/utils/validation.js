export function validate(fields, rules) {
    const errors = {};

    for (const key in rules) {
        const value = fields[key];
        const rule = rules[key];

        if (rule.required && (value === undefined || value === null || value === "")) {
            errors[key] = `${key} is required`;
            continue;
        }

        if (value !== undefined && value !== null) {
            if (rule.type && typeof value !== rule.type) {
                errors[key] = `${key} must be a ${rule.type}`;
                continue;
            }

            if (rule.min && value.length < rule.min) {
                errors[key] = `${key} must be at least ${rule.min} characters`;
                continue;
            }

            if (rule.enum && !rule.enum.includes(value)) {
                errors[key] = `${key} must be one of: ${rule.enum.join(", ")}`;
                continue;
            }
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
}
