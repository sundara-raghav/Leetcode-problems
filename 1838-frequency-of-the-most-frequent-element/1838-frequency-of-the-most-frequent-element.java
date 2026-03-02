class Solution {
    public int maxFrequency(int[] nums, int k) {
        Arrays.sort(nums);
        int maxFrequency = 1;
        int left = 0;
        long currentSum = 0;

        for (int right = 0; right < nums.length; right++) {
            currentSum += nums[right];
            while ((long) nums[right] * (right - left + 1) > currentSum + k) {
                currentSum -= nums[left];
                left++;
            } 
            maxFrequency = Math.max(maxFrequency, right - left + 1);
        }
        return maxFrequency;
    }
}