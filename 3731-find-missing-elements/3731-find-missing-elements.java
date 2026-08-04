import java.util.*;

class Solution {
    public List<Integer> findMissingElements(int[] nums) {
        List<Integer> ls = new LinkedList<>();
        Arrays.sort(nums); 
        int expected = nums[0];
        int index = 0;
        while (expected <= nums[nums.length - 1]) {
            if (index < nums.length && nums[index] == expected) {
               
                while (index < nums.length && nums[index] == expected) {
                    index++;
                }
            } else {
                ls.add(expected);
            }
            expected++;
        }
        
        return ls;
    }
}
