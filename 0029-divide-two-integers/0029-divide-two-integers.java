class Solution {
    public int divide(int dividend, int divisor) {
        // Handle edge case for overflow
        if (dividend == Integer.MIN_VALUE && divisor == -1) {
            return Integer.MAX_VALUE;
        }
        
        // Determine the sign of the result
        boolean negative = (dividend < 0) ^ (divisor < 0);
        
        // Work with absolute values for the division
        long dividendAbs = Math.abs((long) dividend);
        long divisorAbs = Math.abs((long) divisor);
        
        int result = 0;
        
        // Perform the division using bitwise shifts
        while (dividendAbs >= divisorAbs) {
            long tempDivisor = divisorAbs;
            long multiple = 1;
            
            // Double the divisor until it is larger than dividend
            while (dividendAbs >= (tempDivisor << 1)) {
                tempDivisor <<= 1;
                multiple <<= 1;
            }
            
            // Subtract the largest multiple of divisor from the dividend
            dividendAbs -= tempDivisor;
            result += multiple;
        }
        
        // Adjust the sign of the result
        return negative ? -result : result;
    }
}
