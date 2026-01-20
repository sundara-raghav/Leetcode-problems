import java.util.Arrays;

class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int n = nums1.length, m = nums2.length;
        int[] total = new int[n + m];

        System.arraycopy(nums1, 0, total, 0, n);
        System.arraycopy(nums2, 0, total, n, m);
      
        Arrays.sort(total);

        int totalLength = total.length;
        if (totalLength % 2 == 1) {  // Odd length
            return (double) total[totalLength / 2];
        } else {  // Even length
            int middle1 = total[totalLength / 2 - 1];
            int middle2 = total[totalLength / 2];
            return ((double) middle1 + middle2) / 2.0;
        }
    }
}
