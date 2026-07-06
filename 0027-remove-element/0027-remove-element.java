import java.util.ArrayList;
import java.util.List;

class Solution {
    public int removeElement(int[] nums, int val) {
        List<Integer> ls = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != val) {
                ls.add(nums[i]);
            }
        }
    
        for (int i = 0; i < ls.size(); i++) {
            nums[i] = ls.get(i);
        }
        
        return ls.size();
    }
}
