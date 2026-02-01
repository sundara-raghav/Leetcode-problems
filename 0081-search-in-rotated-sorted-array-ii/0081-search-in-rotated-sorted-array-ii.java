class Solution {
    public boolean search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            // If we find the target at mid, return true
            if (nums[mid] == target) {
                return true;
            }

            // If we can't determine which side is sorted (duplicates), just move the pointers
            if (nums[left] == nums[mid] && nums[mid] == nums[right]) {
                left++;
                right--;
            }
            // Left part is sorted
            else if (nums[left] <= nums[mid]) {
                // If target is in the left sorted part, adjust right pointer
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            }
            // Right part is sorted
            else {
                // If target is in the right sorted part, adjust left pointer
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }

        // If we finish the loop, the target is not in the array
        return false;
    }
}
