import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        List<Integer> ls=new LinkedList<>();
        for(int i=0;i<nums1.length;i++) ls.add(nums1[i]);
        for(int i=0;i<nums2.length;i++) ls.add(nums2[i]);
        Collections.sort(ls);
          int size = ls.size();
        if(size % 2 == 0) { 
            return (ls.get(size / 2 - 1) + ls.get(size / 2)) / 2.0;
        } 
        else {
            return ls.get(size / 2);
        }

    }
}