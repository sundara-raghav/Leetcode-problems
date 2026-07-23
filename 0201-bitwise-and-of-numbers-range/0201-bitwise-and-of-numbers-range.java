class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        while (right > left) {
            right &= (right - 1); // Clears the rightmost set bit
        }
        return left & right;
    }
}
