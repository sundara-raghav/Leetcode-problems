class Solution {
    public int findGCD(int[] nums) {
     Arrays.sort(nums);
       int min= nums[0];
       int max=nums[nums.length-1];
       return gcd(min,max);
    }
     private int gcd(int a, int b) {
        while (b != 0) {
            int rem = a % b;
            a = b;
            b = rem;
        }
        return a;
}}