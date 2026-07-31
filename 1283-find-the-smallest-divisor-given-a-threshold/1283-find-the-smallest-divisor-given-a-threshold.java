class Solution {
    public int smallestDivisor(int[] nums, int threshold) {
         int left = 1, right = getMax(nums);    
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (sumAfterDivision(nums, mid) <= threshold) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }   
        return left;
    }
    private int getMax(int[] nums) {
        int max = 0;
        for (int num : nums) {
            max = Math.max(max, num);
        }
        return max;
    }
    private int sumAfterDivision(int[] nums, int d) {
        int sum = 0;
        for (int num : nums) {
            sum += (num + d - 1) / d; 
        }
        return sum;
    }
}
