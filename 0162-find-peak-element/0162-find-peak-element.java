import java.util.Arrays;

class Solution {
    public int findPeakElement(int[] nums) {
        // Create a copy of the input array to avoid modifying the original
        int[] arr = Arrays.copyOf(nums, nums.length);
        int n = nums.length;
        
        // Sort the array to find the largest number
        Arrays.sort(arr);
        int largestNum = arr[n - 1];  // Largest number after sorting
        
        // Loop to find the index of the largest element in the original array
        for (int i = 0; i < n; i++) {
            if (nums[i] == largestNum) {
                return i;  // Return the index and exit the loop
            }
        }
        
        return -1;  // Return -1 if no peak element found (though this shouldn't happen for this problem)
    }
}
