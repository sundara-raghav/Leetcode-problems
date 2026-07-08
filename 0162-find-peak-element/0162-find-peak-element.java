import java.util.Arrays;
class Solution {
    public int findPeakElement(int[] nums) {
        int[] arr = Arrays.copyOf(nums, nums.length);
        int n = nums.length;  
        Arrays.sort(arr);
        int largestNum = arr[n - 1];          
        for (int i = 0; i < n; i++) {
            if (nums[i] == largestNum) {
                return i;  
            }
        }
        return -1;
    }
}