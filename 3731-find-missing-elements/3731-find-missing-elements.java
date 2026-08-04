import java.util.*;

class Solution {
    public List<Integer> findMissingElements(int[] nums) {
        List<Integer> ls = new ArrayList<>();
        Set<Integer> set = new HashSet<>();
        
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;
        
        for (int num : nums) {
            set.add(num);
            if (num < min) min = num;
            if (num > max) max = num;
        }
        
        for (int i = min + 1; i < max; i++) {
            if (!set.contains(i)) {
                ls.add(i);
            }
        }
        
        return ls;
    }
}
