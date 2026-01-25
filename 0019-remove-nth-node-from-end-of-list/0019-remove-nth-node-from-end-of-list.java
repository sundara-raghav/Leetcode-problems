/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode node =new ListNode(0);
         node.next= head;
         ListNode temp=node;
        int count=0;
         while(temp!=null){
           count++;
           temp = temp.next;
         }
         
         temp=node;

         for (int i = 1; i < count - n; i++) {
            temp = temp.next;
        }
        temp.next=temp.next.next;


         
         return node.next;

    }
}