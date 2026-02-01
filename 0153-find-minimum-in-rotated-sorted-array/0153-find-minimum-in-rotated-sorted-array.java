class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        
        while (left < right) {
            int mid = left + (right - left) / 2;

            // If mid element is greater than the rightmost element, the minimum is in the right half
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } 
            // If mid element is less than or equal to the rightmost element, the minimum is in the left half
            else {
                right = mid;
            }
        }
        
        // When left == right, we've found the minimum element
        return nums[left];
    }
}
