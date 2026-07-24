public class Solution {
    public String reverseVowels(String s) {
        if (s == null || s.length() == 0) {
            return s;
        }
        
        char[] chars = s.toCharArray();
        int start = 0;
        int end = chars.length - 1;
        
        while (start < end) {
            if (!isVowel(chars[start])) {
                start++;
            } else if (!isVowel(chars[end])) {
                end--;
            } else {
                char temp = chars[start];
                chars[start] = chars[end];
                chars[end] = temp;  
                start++;
                end--;
            }
        }
        
        return new String(chars);
    }
    
    private boolean isVowel(char c) {
        return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u' ||
               c == 'A' || c == 'E' || c == 'I' || c == 'O' || c == 'U';
    }
}
