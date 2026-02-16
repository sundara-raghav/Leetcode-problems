class Solution {
    public int subtractProductAndSum(int n) {
        int product=1,sum=0,num=n;
        while(n!=0){
            int ld=n%10;
            sum+=ld;
            product*=ld;
            n/=10;
        }
        return product-sum;

    }
}