class Solution {
    public int arraySign(int[] nums) {
        int negativeCount = 0;
        
        for (int num : nums) {
            if (num == 0) {
                return 0; // If any number is zero, the product is zero
            } else if (num < 0) {
                negativeCount++; // Count negatives
            }
        }
        
        // If count of negative numbers is even, product is positive
        return (negativeCount % 2 == 0) ? 1 : -1;
    }
}
