class Solution {
    public boolean isPerfectSquare(int num) {
        if (num < 0) {
            return false;
        }
        // Take the square root (returns a double)
        double root = Math.sqrt(num);
        
        // Cast to integer to remove the decimal part
        int intRoot = (int) root;
        
        // Check if the squared integer equals the original number
        return (intRoot * intRoot == num);
    }
}