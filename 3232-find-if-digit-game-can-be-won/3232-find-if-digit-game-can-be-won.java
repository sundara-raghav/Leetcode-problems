class Solution {
    public boolean canAliceWin(int[] nums) {

        int n = 0;
        int sum = 0;

        for(int i=0; i<nums.length; i++) {
            if(nums[i] <=  9) {
                n += nums[i];
            }
            else {
                sum += nums[i]; 
            }
            
        }
        if(sum == n) {
            return false;
        }
        return true;
    }
}