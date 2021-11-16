/**
 * Formats an arbitrary number of arguments into a string by replacing {0}, {1}, ... {n} with the corresponding argument supplied after 'formatString'.
 *
 * @param formatString The string to be formatted.
 * @param args The list of arguments to splice into formatString.
 * @returns a formatted String
 */
export const format = (formatString: string, ...args: any[]) => {
    return formatString.replace(/\{(\d+)\}/gm, (match, index) => {
        const substitution = args[index];
        if (substitution === undefined) {
            return match;
        }
        return substitution + '';
    });
};