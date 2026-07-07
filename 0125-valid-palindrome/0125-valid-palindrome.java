class Solution {
    public boolean isPalindrome(String s) {
        s = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        return a(s,0,s.length()-1);

    }
    boolean a(String s,int start,int end){
        if(start>=end) return true;
        if (s.charAt(start) != s.charAt(end)) {
            return false;
        }
        return a(s, start + 1, end - 1);
    }
}