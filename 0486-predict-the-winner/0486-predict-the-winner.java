class Solution {
    public boolean predictTheWinner(int[] nums) {
        int n = nums.length;
        return bt(0, 0, 0, 0, n - 1, nums);
    }

    private boolean bt(int turn, int p1Score, int p2Score,
                       int left, int right, int[] nums) {

        if(left > right)
            return p1Score >= p2Score;

        if((turn & 1) == 0){
            return bt(turn ^ 1, p1Score + nums[left], p2Score,
                      left + 1, right, nums)
                || bt(turn ^ 1, p1Score + nums[right], p2Score,
                      left, right - 1, nums);
        }

        return bt(turn ^ 1, p1Score, p2Score + nums[left],
                  left + 1, right, nums)
            && bt(turn ^ 1, p1Score, p2Score + nums[right],
                  left, right - 1, nums);
    }
}