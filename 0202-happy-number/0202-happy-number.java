class Solution {
    public boolean isHappy(int n) {
        for (int i = 0; i < 1000; i++) {
            n = getSquareSum(n);
            if (n == 1) return true;
        }
        return false; 
    }

    private int getSquareSum(int n) {
        int sum = 0;
        while (n > 0) {
            int digit = n % 10;
            sum += digit * digit;
            n /= 10;
        }
        return sum;
    }
}
