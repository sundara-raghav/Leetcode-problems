class Solution {
    public int sumOfMultiples(int n) {
        int ret = 0;

        ret += 3*((n/3)*((n/3)+1)/2);
        ret += 5*((n/5)*((n/5)+1)/2);
        ret += 7*((n/7)*((n/7)+1)/2);

        ret -= 15*((n/15)*((n/15)+1)/2);
        ret -= 21*((n/21)*((n/21)+1)/2);
        ret -= 35*((n/35)*((n/35)+1)/2);

        ret += 105*((n/105)*((n/105)+1)/2);

        return ret;
    }
}