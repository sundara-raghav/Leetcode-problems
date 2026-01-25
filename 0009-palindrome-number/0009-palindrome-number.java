class Solution {
    public static boolean isPalindrome(int x) {
        
        int reversed = 0;
        int m=x;
        while (x != 0) {
  
            int digit = x % 10;
            x /= 10; 
            reversed = reversed * 10 + digit;
        }
        if(m==0) return true;
        return (m==reversed && m>0)?true:false;
        
    }
    public static void main(String[] args) {
      
        Scanner scanner = new Scanner(System.in);
        System.out.print("X = ");
        int x = scanner.nextInt();
        boolean result = isPalindrome(x);
        System.out.println(result);
      
    }
}