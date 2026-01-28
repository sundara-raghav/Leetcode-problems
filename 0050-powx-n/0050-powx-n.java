class Solution {
    double myPow(double x, int n) {
        if (n == 0) return 1.0;
        
        if (n < 0) {
            x = 1 / x;
            // Handle Integer.MIN_VALUE explicitly
            if (n == Integer.MIN_VALUE) {
                return x * Math.pow(x, -(n + 1));
            }
            n = -n;
        }
        
        return Math.pow(x, n);
    }
}
