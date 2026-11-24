// Lessons and questions. Trace answers are filled in by build.js from real Java output.
const R = String.raw;

const TOPICS = [
  // ---------------- UNIT 1 ----------------
  { id: '1.3', unit: 1, title: 'Expressions and output', file: 'Output.java', cards: [
    { h: 'print vs println', p: '<code>println</code> prints, then moves to a new line. <code>print</code> stays on the same line, so the next thing printed lands right after it.',
      code: R`System.out.print("A");
System.out.print("B");
System.out.println("C");
System.out.println("D");` },
    { h: 'Integer division throws away the decimal', p: 'When <b>both</b> sides are <code>int</code>, Java does integer division: it chops off the decimal (it does not round). <code>7 / 2</code> is <code>3</code>, and <code>2 / 3</code> is <code>0</code>. If either side is a <code>double</code>, you get the real answer.',
      code: R`System.out.println(7 / 2);
System.out.println(2 / 3);
System.out.println(7 / 2.0);
System.out.println(7.0 / 2);`, trap: 'This is the single most tested trap in Unit 1. Before you compute any division, check the types first.' },
    { h: '% is the remainder', p: '<code>a % b</code> gives the remainder after dividing. <code>17 % 5</code> is <code>2</code> because 17 = 3×5 + 2. Two patterns show up constantly: <code>n % 2 == 0</code> means n is even, and <code>n % 10</code> is the last digit of n.',
      code: R`System.out.println(17 % 5);
System.out.println(10 % 2);
System.out.println(4 % 7);
System.out.println(1234 % 10);` },
    { h: 'Order of operations, and + with Strings', p: '<code>*</code>, <code>/</code>, <code>%</code> happen before <code>+</code> and <code>-</code>. Ties go left to right. Once a String is on one side of <code>+</code>, it glues text instead of adding. Java goes left to right, so where the String sits changes everything.',
      code: R`System.out.println(2 + 3 * 4);
System.out.println("1" + 2 + 3);
System.out.println(1 + 2 + "3");
System.out.println("Sum: " + (1 + 2));` },
  ] },
  { id: '1.4', unit: 1, title: 'Variables and assignment', file: 'Variables.java', cards: [
    { h: 'A variable is a labeled box', p: 'Declaring (<code>int x;</code>) makes the box. Assigning (<code>x = 5;</code>) puts a value in it. Doing both at once (<code>int x = 5;</code>) is initializing. The <code>=</code> sign means "store", not "equals".',
      code: R`int x;
x = 5;
int y = x + 2;
x = 10;
System.out.println(x + " " + y);`, trap: 'Changing x later does NOT change y. y got a copy of the value at that moment.' },
    { h: 'Right side first, then store', p: 'Java computes the whole right side using the <b>current</b> values, then stores the result on the left. That is why <code>x = x + 1</code> makes sense: take the old x, add 1, store it back.',
      code: R`int count = 3;
count = count + 1;
count = count * 2;
System.out.println(count);` },
    { h: 'Swapping needs a third variable', p: 'If you write <code>a = b; b = a;</code> you lose a\'s original value. Save it in a temp variable first. Trace this one step by step and watch the boxes.',
      code: R`int a = 1;
int b = 2;
int temp = a;
a = b;
b = temp;
System.out.println(a + " " + b);` },
  ] },
  { id: '1.5', unit: 1, title: 'Casting and ranges', file: 'Casting.java', cards: [
    { h: 'Casting changes the type', p: '<code>(int)</code> turns a double into an int by <b>chopping off</b> the decimal, toward zero. <code>(int) 3.99</code> is 3 and <code>(int) -3.99</code> is -3. <code>(double)</code> turns an int into a double. Java does int → double on its own (widening), but never double → int without a cast.',
      code: R`System.out.println((int) 3.99);
System.out.println((int) -3.99);
System.out.println((double) 5);
double d = 10;
System.out.println(d);` },
    { h: 'Where the cast goes matters', p: 'A cast only applies to the thing right after it. <code>(double) 7 / 2</code> casts the 7 first, so it is 7.0 / 2 = 3.5. But <code>(double) (7 / 2)</code> does the integer division first (3) and then casts: 3.0.',
      code: R`System.out.println((double) 7 / 2);
System.out.println((double) (7 / 2));
System.out.println(7 / 2 * 1.0);` },
    { h: 'Rounding with a cast', p: 'From your notes: for a positive number, <code>(int) (x + 0.5)</code> rounds to the nearest int. For negatives, subtract 0.5 instead.',
      code: R`double a = 3.8;
double b = 3.2;
System.out.println((int) (a + 0.5));
System.out.println((int) (b + 0.5));
double c = -3.8;
System.out.println((int) (c - 0.5));` },
    { h: 'int has a max, and it wraps', p: 'An int holds -2147483648 to 2147483647 (<code>Integer.MIN_VALUE</code> to <code>Integer.MAX_VALUE</code>). Going past the max does not crash. It wraps around to the minimum. That is overflow.',
      code: R`int big = Integer.MAX_VALUE;
System.out.println(big);
System.out.println(big + 1);` },
  ] },
  { id: '1.6', unit: 1, title: 'Compound assignment', file: 'Compound.java', cards: [
    { h: 'Shortcuts', p: '<code>x += 3</code> means <code>x = x + 3</code>. Same idea for <code>-=</code>, <code>*=</code>, <code>/=</code>, <code>%=</code>. <code>x++</code> adds 1 and <code>x--</code> subtracts 1. On the AP exam, ++ and -- are used as their own statements, so you do not need the x++ vs ++x tricks.',
      code: R`int x = 10;
x += 5;
x -= 3;
x *= 2;
x /= 5;
x %= 3;
x++;
System.out.println(x);` },
    { h: 'Integer rules still apply', p: '<code>/=</code> on an int still does integer division. Run this and predict each line before stepping.',
      code: R`int n = 17;
n /= 2;
System.out.println(n);
n %= 3;
System.out.println(n);` },
  ] },
  { id: '1.9', unit: 1, title: 'Methods: headers, calls, return', file: 'Methods.java', cards: [
    { h: 'Reading a method header', p: '<code>public static int square(int n)</code>: <code>int</code> is the return type (what comes back), <code>square</code> is the name, <code>int n</code> is the parameter. The <b>signature</b> is just the name plus parameter types: <code>square(int)</code>. The return type is not part of the signature.',
      code: R`public class Main {
    public static int square(int n) {
        return n * n;
    }

    public static void main(String[] args) {
        int a = square(3);
        System.out.println(a);
        System.out.println(square(a));
    }
}` },
    { h: 'void vs non-void', p: 'A <code>void</code> method does something and gives nothing back, so you just call it on its own line. A non-void method hands back a value with <code>return</code>, and you should use that value (store it or print it). <code>return</code> ends the method immediately.',
      code: R`public class Main {
    public static void greet(String name) {
        System.out.println("Hi " + name);
    }

    public static int twice(int x) {
        return x * 2;
        // anything here would never run
    }

    public static void main(String[] args) {
        greet("Dylan");
        twice(5);
        System.out.println(twice(5));
    }
}`, trap: 'twice(5) on its own line runs, but the 10 it returns is thrown away. Nothing prints.' },
    { h: 'Parameters get copies', p: 'When you call a method, each argument\'s value is <b>copied</b> into the parameter. Changing the parameter inside the method does not change the caller\'s variable. Step through and watch two separate frames.',
      code: R`public class Main {
    public static void addTen(int n) {
        n = n + 10;
        System.out.println("inside: " + n);
    }

    public static void main(String[] args) {
        int score = 5;
        addTen(score);
        System.out.println("outside: " + score);
    }
}` },
    { h: 'Overloading', p: 'Two methods can share a name if their parameter lists differ. Java picks the one whose signature matches the arguments.',
      code: R`public class Main {
    public static int add(int a, int b) {
        return a + b;
    }

    public static double add(double a, double b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(add(2, 3));
        System.out.println(add(2.0, 3));
    }
}` },
  ] },
  { id: '1.11', unit: 1, title: 'The Math class', file: 'MathClass.java', cards: [
    { h: 'The four you need', p: '<code>Math.abs(x)</code> absolute value (int in, int out; double in, double out). <code>Math.pow(a, b)</code> a to the b, <b>always a double</b>. <code>Math.sqrt(x)</code> square root, always a double. <code>Math.random()</code> a double from 0.0 up to but not including 1.0.',
      code: R`System.out.println(Math.abs(-4));
System.out.println(Math.abs(-3.5));
System.out.println(Math.pow(2, 3));
System.out.println(Math.sqrt(9));
System.out.println(Math.sqrt(2));` },
    { h: 'Random ints in a range', p: 'Stretch, cast, shift: <code>(int) (Math.random() * (max - min + 1)) + min</code>. For 1 to 6 that is <code>(int) (Math.random() * 6) + 1</code>. The parentheses around the multiply matter: <code>(int) Math.random() * 6</code> casts first and is always 0.',
      code: R`int die = (int) (Math.random() * 6) + 1;
System.out.println("You rolled " + die);
int broken = (int) Math.random() * 6;
System.out.println("Broken version: " + broken);` },
    { h: 'Nested calls run inside out', p: 'The inner call runs first and its result becomes the argument for the outer call. Classic example: distance between two points.',
      code: R`int x1 = 0, y1 = 0, x2 = 3, y2 = 4;
double dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
System.out.println(dist);` },
  ] },
  { id: '1.12', unit: 1, title: 'Objects, references, and null', file: 'Objects.java', cards: [
    { h: 'Class vs object', p: 'A <b>class</b> is the blueprint (Turtle). An <b>object</b> is one actual thing built from it (yertle). <code>new</code> calls a <b>constructor</b>, which builds the object and sets its starting values. A class can have several constructors with different parameter lists (overloading).',
      code: R`String a = new String("hi");
String b = "hello";
System.out.println(a.length() + b.length());` },
    { h: 'Reference variables hold an address', p: 'A primitive variable (<code>int x = 5</code>) holds the value itself. An object variable holds a <b>reference</b>: where the object lives in memory. <code>null</code> means it points at nothing. Calling a method on null crashes with a NullPointerException.',
      code: R`String name = null;
System.out.println("before");
System.out.println(name.length());
System.out.println("after");`, trap: '"after" never prints. The crash stops the program on the line where it happens.' },
    { h: 'Instance vs class (static) methods', p: 'Instance methods are called on an object: <code>yertle.forward()</code>, <code>name.length()</code>. Class methods are static and called on the class name: <code>Math.sqrt(9)</code>. A getter like <code>getWidth()</code> is a non-void instance method that hands back a value.',
      code: R`String word = "turtle";
int n = word.length();
double r = Math.sqrt(n * 6);
System.out.println(n + " " + r);` },
  ] },
  { id: '1.15', unit: 1, title: 'String methods', file: 'Strings.java', cards: [
    { h: 'Indexes start at 0', p: 'In <code>"HELLO"</code>, H is index 0 and O is index 4. <code>length()</code> is 5. The last index is always <code>length() - 1</code>.',
      code: R`String s = "HELLO";
System.out.println(s.length());
System.out.println(s.substring(0, 1));
System.out.println(s.substring(4, 5));` },
    { h: 'substring(a, b) stops BEFORE b', p: '<code>s.substring(1, 4)</code> gives indexes 1, 2, 3 (not 4). Length of the result is b - a. <code>s.substring(a)</code> goes from a to the end. Going past the end crashes with StringIndexOutOfBoundsException. <code>substring(i, i + 1)</code> grabs one letter: you will use that pattern constantly in Unit 2.',
      code: R`String s = "COMPUTER";
System.out.println(s.substring(1, 4));
System.out.println(s.substring(5));
System.out.println(s.substring(3, 3));
System.out.println(s.substring(2, 3));` },
    { h: 'indexOf finds, -1 means not found', p: '<code>s.indexOf("x")</code> returns the index of the first match, or <b>-1</b> if it is not there.',
      code: R`String s = "banana";
System.out.println(s.indexOf("a"));
System.out.println(s.indexOf("nan"));
System.out.println(s.indexOf("z"));` },
    { h: 'equals, compareTo, and immutability', p: 'Compare String contents with <code>.equals()</code>, never <code>==</code> (that compares addresses). <code>a.compareTo(b)</code> is negative if a comes first alphabetically, 0 if equal, positive if a comes after. Strings never change: <code>s.toUpperCase()</code> makes a <b>new</b> String; s stays the same unless you reassign it.',
      code: R`String a = "apple";
String b = "banana";
System.out.println(a.compareTo(b) < 0);
System.out.println(a.equals("apple"));
String s = "hi";
s.toUpperCase();
System.out.println(s);
s = s.toUpperCase();
System.out.println(s);` },
  ] },

  // ---------------- UNIT 2 ----------------
  { id: '2.1', unit: 2, title: 'Algorithms: the 3 building blocks', file: 'Algorithms.java', cards: [
    { h: 'Sequencing, selection, repetition', p: 'Every algorithm is built from three things. <b>Sequencing</b>: steps run in order. <b>Selection</b>: a true/false decision picks a path (if statements). <b>Repetition</b>: steps repeat until something changes (loops). Your notes\' ATM example has all three.',
      code: R`int balance = 100;
int withdraw = 30;
if (withdraw <= balance) {
    balance -= withdraw;
}
int months = 0;
while (balance < 200) {
    balance += 50;
    months++;
}
System.out.println(balance + " after " + months + " months");` },
    { h: 'Order matters', p: 'The same steps in a different order can give a different result. Check permission before showing data, check the divisor before dividing.',
      code: R`int x = 5;
x = x * 2;
x = x + 3;
System.out.println(x);
int y = 5;
y = y + 3;
y = y * 2;
System.out.println(y);` },
  ] },
  { id: '2.2', unit: 2, title: 'Boolean expressions', file: 'Booleans.java', cards: [
    { h: 'Every comparison is true or false', p: 'The operators <code>==  !=  &lt;  &gt;  &lt;=  &gt;=</code> produce a boolean. Math happens first, then the comparison. A <code>boolean</code> variable can store the result.',
      code: R`int score = 60;
boolean passed = score >= 60;
System.out.println(passed);
System.out.println(score > 60);
System.out.println(score + 5 == 65);
System.out.println(score != 60);` },
    { h: 'Boundary values', p: 'The most common trace mistake: <code>&gt;</code> vs <code>&gt;=</code> when the value is exactly on the line. When a question gives you 60 and the condition says 60, slow down.',
      code: R`int age = 13;
System.out.println(age > 13);
System.out.println(age >= 13);
System.out.println(age < 13);` },
    { h: '= stores, == compares', p: '<code>=</code> is assignment. <code>==</code> asks a question. <code>if (x = 5)</code> does not even compile in Java because x = 5 is an int, not a boolean.',
      code: R`int x = 3;
boolean same = x == 3;
x = 4;
System.out.println(same);
System.out.println(x == 3);` },
    { h: '== vs .equals for Strings', p: 'This is the "String pool?" question from your notes. For objects, <code>==</code> asks "are these the <b>same object</b> in memory?" <code>.equals</code> asks "do they have the <b>same text</b>?" Java reuses one object for identical literals like <code>"hi"</code> (that is the String pool), so == can accidentally work, then fail when a String is built with <code>new</code> or by a method. Always use .equals for Strings.',
      code: R`String a = "hi";
String b = "hi";
String c = new String("hi");
System.out.println(a == b);
System.out.println(a == c);
System.out.println(a.equals(c));`, trap: 'a == b is true only because both point at the same pooled "hi". a == c is false even though the text matches.' },
  ] },
  { id: '2.3', unit: 2, title: 'if statements', file: 'IfStatements.java', cards: [
    { h: 'One-way: if', p: 'If the condition is true, run the block. If false, skip it and continue after the closing brace.',
      code: R`int temp = 85;
if (temp > 80) {
    System.out.println("Hot");
}
System.out.println("Done");` },
    { h: 'Two-way: if / else', p: 'Exactly one of the two blocks runs. Never both, never neither.',
      code: R`int n = 7;
if (n % 2 == 0) {
    System.out.println("even");
} else {
    System.out.println("odd");
}` },
    { h: 'Multiway: else if chain', p: 'Java checks top to bottom and runs only the <b>first</b> true branch, then skips the rest of the chain. Order your conditions from most specific to least.',
      code: R`int score = 85;
if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");
} else if (score >= 70) {
    System.out.println("C");
} else {
    System.out.println("F");
}`, trap: 'score >= 70 is also true, but it never gets checked. The chain stopped at B.' },
    { h: 'Separate ifs are NOT a chain', p: 'Three separate <code>if</code>s each get checked on their own, so several can run. Compare this to the chain above.',
      code: R`int score = 85;
if (score >= 90) {
    System.out.println("A");
}
if (score >= 80) {
    System.out.println("B");
}
if (score >= 70) {
    System.out.println("C");
}` },
  ] },
  { id: '2.4', unit: 2, title: 'Nested if statements', file: 'NestedIf.java', cards: [
    { h: 'An if inside an if', p: 'The inner if is only checked when the outer condition is true. Think of it as a gate, then another gate.',
      code: R`int age = 16;
boolean hasPermit = false;
if (age >= 16) {
    if (hasPermit) {
        System.out.println("Can drive");
    } else {
        System.out.println("Get a permit");
    }
} else {
    System.out.println("Too young");
}` },
    { h: 'else belongs to the closest if', p: 'Without braces, an <code>else</code> attaches to the nearest unmatched <code>if</code>, no matter how it is indented. Indentation means nothing to Java.',
      code: R`int x = 5;
if (x > 10)
    if (x > 20)
        System.out.println("big");
else
    System.out.println("not big");
System.out.println("end");`, trap: 'Looks like the else goes with x > 10, but it goes with x > 20. Since x > 10 is false, nothing inside runs.' },
    { h: 'From your Battle Damage lab', p: 'Nested ifs are how the lab worked: first check hit or miss, and only on a hit check the weapon and critical. Here is the same logic with a fixed roll so you can trace it.',
      code: R`int roll = 19;
int armorClass = 4;
int level = 3;
int weapon = 2;
if (roll >= armorClass * 3) {
    int damage = 10 + level;
    if (weapon == 1) {
        damage += 2;
    } else if (weapon == 2) {
        damage += 1;
    } else {
        damage += 3;
    }
    if (roll >= 18) {
        damage *= 2;
    }
    damage -= armorClass;
    System.out.println("Hit for " + damage);
} else {
    System.out.println("MISS");
}` },
  ] },
  { id: '2.5', unit: 2, title: 'Compound boolean expressions', file: 'Compound.java', cards: [
    { h: '&&, ||, !', p: '<code>a && b</code> is true only if both are true. <code>a || b</code> is true if at least one is true. <code>!a</code> flips it. Order: <code>!</code> first, then <code>&&</code>, then <code>||</code> (like × before +).',
      code: R`int x = 7;
System.out.println(x > 5 && x < 10);
System.out.println(x < 5 || x == 7);
System.out.println(!(x > 5));
System.out.println(true || false && false);` },
    { h: 'Short-circuit evaluation', p: 'Java stops as soon as it knows the answer. With <code>&&</code>, if the left side is false, the right side never runs. With <code>||</code>, if the left is true, the right never runs. This is how you avoid crashes, like dividing by zero.',
      code: R`int count = 0;
int total = 50;
if (count != 0 && total / count > 10) {
    System.out.println("big average");
} else {
    System.out.println("safe");
}`, trap: 'Flip the two sides and this crashes with ArithmeticException, because total / count runs first.' },
    { h: 'Ranges need two comparisons', p: 'Math class lets you write 1 &lt; x &lt; 10. Java does not. Write <code>x &gt; 1 && x &lt; 10</code>. Outside a range uses <code>||</code>.',
      code: R`int x = 12;
boolean inside = x >= 1 && x <= 10;
boolean outside = x < 1 || x > 10;
System.out.println(inside + " " + outside);` },
  ] },
  { id: '2.6', unit: 2, title: 'Comparing boolean expressions', file: 'DeMorgan.java', cards: [
    { h: 'Equivalent means same result for EVERY input', p: 'Two expressions are equivalent only if they match in every case. One mismatch and they are not. To check fast, test edge cases (the boundary value, and one on each side).',
      code: R`int x = 5;
System.out.println(!(x > 5));
System.out.println(x <= 5);
System.out.println(x < 5);` },
    { h: "De Morgan's laws", p: 'When you push a <code>!</code> inside parentheses, flip each piece and swap <code>&&</code> with <code>||</code>.<br><code>!(a && b)</code> is the same as <code>!a || !b</code><br><code>!(a || b)</code> is the same as <code>!a && !b</code><br>Flipping a comparison: <code>!(x &gt; 5)</code> becomes <code>x &lt;= 5</code> (not x &lt; 5).',
      code: R`int x = 3;
int y = 8;
System.out.println(!(x > 5 && y > 5));
System.out.println(x <= 5 || y <= 5);
System.out.println(!(x > 5 || y > 5));
System.out.println(x <= 5 && y <= 5);` },
  ] },
  { id: '2.7', unit: 2, title: 'while loops', file: 'WhileLoops.java', cards: [
    { h: 'The four parts of every loop', p: '1) <b>Initialize</b> a variable. 2) Check the <b>condition</b>. 3) Run the <b>body</b>. 4) <b>Update</b> so the loop can eventually stop. Then back to step 2. If the condition is false the very first time, the body runs zero times.',
      code: R`int i = 1;
while (i <= 3) {
    System.out.println("pass " + i);
    i++;
}
System.out.println("i ended at " + i);`, trap: 'After the loop, i is 4, not 3. The loop stops because i became 4 and the condition failed.' },
    { h: 'Forget the update = infinite loop', p: 'If nothing in the body moves the variable toward making the condition false, the loop never ends. Step through this and the debugger will stop it for you.',
      code: R`int n = 5;
while (n > 0) {
    System.out.println(n);
}` },
    { h: 'Indefinite loops: digits', p: 'A while loop is perfect when you do not know the count ahead of time. Classic AP pattern: peel off digits with <code>% 10</code> (last digit) and <code>/ 10</code> (drop last digit) until nothing is left.',
      code: R`int num = 4721;
int sum = 0;
while (num > 0) {
    sum += num % 10;
    num /= 10;
}
System.out.println(sum);` },
    { h: 'Sentinel loops', p: 'A sentinel is a special stop value. The loop keeps going until it sees it. Here, doubling until we pass 100.',
      code: R`int value = 3;
int steps = 0;
while (value <= 100) {
    value *= 2;
    steps++;
}
System.out.println(value + " in " + steps + " steps");` },
  ] },
  { id: '2.8', unit: 2, title: 'for loops', file: 'ForLoops.java', cards: [
    { h: 'All four parts on one line', p: '<code>for (init; condition; update)</code>. Order: init runs once, then condition → body → update → condition → body → update... until the condition is false. The update runs <b>after</b> the body.',
      code: R`for (int i = 0; i < 4; i++) {
    System.out.print(i + " ");
}
System.out.println();` },
    { h: 'Counting how many times', p: '<code>i = 0; i &lt; n</code> runs n times. <code>i = 1; i &lt;= n</code> also runs n times. <code>i = 0; i &lt;= n</code> runs n + 1 times. Off-by-one errors are the most common loop bug.',
      code: R`int a = 0;
for (int i = 0; i < 5; i++) { a++; }
int b = 0;
for (int i = 1; i <= 5; i++) { b++; }
int c = 0;
for (int i = 0; i <= 5; i++) { c++; }
System.out.println(a + " " + b + " " + c);` },
    { h: 'Steps other than 1', p: 'The update can be anything: count by 2, count down, multiply.',
      code: R`for (int i = 10; i > 0; i -= 3) {
    System.out.print(i + " ");
}
System.out.println();
for (int k = 1; k < 50; k *= 3) {
    System.out.print(k + " ");
}
System.out.println();` },
    { h: 'for and while are the same machine', p: 'Any for loop can be rewritten as a while loop: move the init above, the update to the end of the body. One difference: a variable declared in the for header disappears after the loop.',
      code: R`for (int i = 0; i < 3; i++) {
    System.out.print(i);
}
System.out.println();
int j = 0;
while (j < 3) {
    System.out.print(j);
    j++;
}
System.out.println();` },
  ] },
  { id: '2.9', unit: 2, title: 'Loop algorithms', file: 'LoopAlgorithms.java', cards: [
    { h: 'Accumulator: running total', p: 'Start at 0 (or 1 for a product), add inside the loop. Your notes: "on the AP exam there\'s always something with sums."',
      code: R`int sum = 0;
for (int i = 1; i <= 5; i++) {
    sum += i;
}
System.out.println(sum);` },
    { h: 'Counter: how many match', p: 'Start a counter at 0 and add 1 only when an if is true.',
      code: R`int count = 0;
for (int n = 1; n <= 20; n++) {
    if (n % 3 == 0) {
        count++;
    }
}
System.out.println(count);` },
    { h: 'Min and max', p: 'Start with the first value (or an extreme like Integer.MAX_VALUE for a min), then replace it whenever you see something better.',
      code: R`int a = 7, b = 2, c = 9, d = 4;
int max = a;
if (b > max) { max = b; }
if (c > max) { max = c; }
if (d > max) { max = d; }
System.out.println(max);` },
    { h: 'Early exit with a flag', p: 'To check "is there any..." or "are all...", use a boolean that starts one way and flips if you find a counterexample. Example: is 29 prime?',
      code: R`int n = 29;
boolean isPrime = n > 1;
for (int d = 2; d < n; d++) {
    if (n % d == 0) {
        isPrime = false;
    }
}
System.out.println(isPrime);` },
  ] },
  { id: '2.10', unit: 2, title: 'String algorithms', file: 'StringAlgorithms.java', cards: [
    { h: 'Walk through a String one letter at a time', p: 'Loop i from 0 while <code>i &lt; s.length()</code>, and grab the letter with <code>s.substring(i, i + 1)</code>. Using <code>&lt;=</code> crashes on the last pass.',
      code: R`String s = "cat";
for (int i = 0; i < s.length(); i++) {
    String letter = s.substring(i, i + 1);
    System.out.println(i + ": " + letter);
}` },
    { h: 'Count a letter', p: 'Traverse plus a counter plus <code>.equals</code>.',
      code: R`String word = "mississippi";
int count = 0;
for (int i = 0; i < word.length(); i++) {
    if (word.substring(i, i + 1).equals("s")) {
        count++;
    }
}
System.out.println(count);` },
    { h: 'Build a new String', p: 'Start with <code>""</code> and add letters. Putting each new letter in front reverses the word.',
      code: R`String s = "stop";
String rev = "";
for (int i = 0; i < s.length(); i++) {
    rev = s.substring(i, i + 1) + rev;
}
System.out.println(rev);` },
    { h: 'Find every match with indexOf', p: 'Find a match, then chop off everything up to and including it, and search again. Stop when indexOf gives -1.',
      code: R`String s = "a-b-c-d";
int dashes = 0;
int pos = s.indexOf("-");
while (pos != -1) {
    dashes++;
    s = s.substring(pos + 1);
    pos = s.indexOf("-");
}
System.out.println(dashes);` },
  ] },
  { id: '2.11', unit: 2, title: 'Nested loops', file: 'NestedLoops.java', cards: [
    { h: 'The inner loop runs all the way for each outer pass', p: 'Outer loop starts pass 1 → inner loop runs completely → outer pass 2 → inner runs completely again. Like a clock: the minute hand goes all the way around for every hour.',
      code: R`for (int row = 1; row <= 3; row++) {
    for (int col = 1; col <= 4; col++) {
        System.out.print("*");
    }
    System.out.println();
}` },
    { h: 'Total runs = outer × inner', p: 'If the inner bounds do not depend on the outer variable, the inner body runs (outer count) × (inner count) times.',
      code: R`int count = 0;
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 5; j++) {
        count++;
    }
}
System.out.println(count);` },
    { h: 'Triangles: inner depends on outer', p: 'When the inner bound uses the outer variable, each row gets a different length.',
      code: R`for (int i = 1; i <= 4; i++) {
    for (int j = 1; j <= i; j++) {
        System.out.print(j);
    }
    System.out.println();
}` },
  ] },
  { id: '2.12', unit: 2, title: 'Counting loop runs', file: 'RunTime.java', cards: [
    { h: 'Informal run-time analysis', p: 'The AP exam asks "how many times does this statement execute?" Count passes with the formula, then check it by tracing a small case. For <code>i = a; i &lt; b; i++</code> the count is b - a. For <code>&lt;=</code> it is b - a + 1.',
      code: R`int runs = 0;
for (int i = 3; i < 10; i++) {
    runs++;
}
System.out.println(runs);` },
    { h: 'Steps that are not 1', p: 'Counting by 2 roughly halves it. Doubling (i *= 2) grows fast, so very few passes. When in doubt, write out the values of i.',
      code: R`int a = 0;
for (int i = 0; i < 10; i += 2) { a++; }
int b = 0;
for (int i = 1; i < 100; i *= 2) { b++; }
System.out.println(a + " " + b);` },
    { h: 'Triangle nested loops', p: 'When the inner loop depends on the outer, add up each row: 1 + 2 + 3 + ... + n.',
      code: R`int count = 0;
for (int i = 1; i <= 4; i++) {
    for (int j = 1; j <= i; j++) {
        count++;
    }
}
System.out.println(count);` },
  ] },
];

// q.t: trace | fill | bug | mc
const QUESTIONS = [
  // ===== 1.3 =====
  { t: 'trace', topic: '1.3', code: R`System.out.println(17 / 5);
System.out.println(17 % 5);`, wrong: ['3.4\n2', '3\n3', '3.4\n0.4'], why: '17 / 5 is int / int, so the decimal is chopped: 3. The remainder is 17 - 15 = 2.' },
  { t: 'trace', topic: '1.3', code: R`System.out.print("Hi");
System.out.print("There");
System.out.println("!");
System.out.println("Bye");`, wrong: ['Hi\nThere\n!\nBye', 'HiThere!Bye', 'Hi There !\nBye'], why: 'print stays on the same line. Only println moves to a new line after printing.' },
  { t: 'trace', topic: '1.3', code: R`System.out.println(1 + 2 + "3" + 4 + 5);`, wrong: ['15', '12345', '339'], why: 'Left to right: 1 + 2 = 3 (both ints). Then 3 + "3" = "33" (now a String). After that every + glues: "334", "3345".' },
  { t: 'trace', topic: '1.3', code: R`int a = 10;
int b = 4;
double c = a / b;
System.out.println(c);`, wrong: ['2.5', '2', '3.0'], why: 'a / b is int / int = 2, computed BEFORE it gets stored. Storing 2 in a double just makes it 2.0.' },
  { t: 'trace', topic: '1.3', code: R`System.out.println(10 - 4 / 2 * 3 % 4);`, wrong: ['9', '1', '6'], why: '/, *, % go first, left to right: 4 / 2 = 2, 2 * 3 = 6, 6 % 4 = 2. Then 10 - 2 = 8.' },
  { t: 'trace', topic: '1.3', code: R`System.out.println(5 % 8);
System.out.println(8 % 8);
System.out.println(-7 % 3);`, wrong: ['3\n1\n2', '5\n0\n2', '0\n0\n-2'], why: 'When the left side is smaller, the remainder is the whole left side: 5 % 8 = 5. 8 % 8 = 0. In Java the remainder takes the sign of the left side: -7 % 3 = -1.' },
  { t: 'trace', topic: '1.3', code: R`System.out.println("Total: " + 3 + 4);
System.out.println("Total: " + (3 + 4));`, wrong: ['Total: 7\nTotal: 7', 'Total: 34\nTotal: 34', 'Total: 7\nTotal: 34'], why: 'Without parentheses, "Total: " + 3 is a String, so + 4 glues another character. Parentheses force the addition first.' },
  { t: 'mc', topic: '1.3', q: 'Which expression evaluates to 2.5?', answer: '5.0 / 2', wrong: ['5 / 2', '(double) (5 / 2)', '5 / 2 * 1.0'], why: 'Only 5.0 / 2 has a double in the division itself. The others do integer division first (giving 2) and then turn 2 into 2.0.', verify: R`System.out.println(5.0 / 2);
System.out.println(5 / 2);
System.out.println((double) (5 / 2));
System.out.println(5 / 2 * 1.0);`, vout: '2.5\n2\n2.0\n2.0' },

  // ===== 1.4 =====
  { t: 'trace', topic: '1.4', code: R`int x = 4;
int y = x;
x = x + 3;
System.out.println(x + " " + y);`, wrong: ['7 7', '4 4', '7 3'], why: 'y gets a copy of x\'s value (4) at that moment. Changing x afterwards does not touch y.' },
  { t: 'trace', topic: '1.4', code: R`int a = 5;
int b = 9;
a = b;
b = a;
System.out.println(a + " " + b);`, wrong: ['9 5', '5 9', '5 5'], why: 'This swap is broken. After a = b, both are 9, and the original 5 is gone. You need a temp variable.' },
  { t: 'trace', topic: '1.4', code: R`int n = 2;
n = n * n;
n = n * n;
n = n - 1;
System.out.println(n);`, wrong: ['3', '7', '8'], why: '2 → 4 → 16 → 15. Each line uses the value stored by the line before.' },
  { t: 'fill', topic: '1.4', task: 'Swap the values so it prints "8 3".', code: R`int a = 3;
int b = 8;
int temp = a;
a = b;
____
System.out.println(a + " " + b);`, opts: ['b = temp;', 'b = a;', 'temp = b;', 'a = temp;'], expect: '8 3', why: 'temp saved a\'s original 3. a now holds 8, so b needs the saved 3 from temp.' },
  { t: 'bug', topic: '1.4', task: 'Should print 15.', code: R`int total;
total = total + 15;
System.out.println(total);`, bug: 1, fix: 'int total = 0;', expect: '15', why: 'A local variable has no value until you give it one. Java refuses to compile total + 15 because total might not have been initialized.' },

  // ===== 1.5 =====
  { t: 'trace', topic: '1.5', code: R`double d = 9.99;
int n = (int) d;
System.out.println(n);
System.out.println((int) -9.99);`, wrong: ['10\n-10', '9\n-10', '10\n-9'], why: '(int) truncates toward zero, it never rounds. 9.99 → 9 and -9.99 → -9.' },
  { t: 'trace', topic: '1.5', code: R`System.out.println((double) 9 / 2);
System.out.println((double) (9 / 2));`, wrong: ['4.5\n4.5', '4.0\n4.5', '4\n4.0'], why: 'The cast grabs only the 9 in the first line (9.0 / 2 = 4.5). In the second, 9 / 2 = 4 happens first, then becomes 4.0.' },
  { t: 'trace', topic: '1.5', code: R`int a = 7;
int b = 2;
double avg = (a + b) / 2;
System.out.println(avg);`, wrong: ['4.5', '4', '5.0'], why: '(a + b) / 2 is 9 / 2, an int division = 4. It is stored as 4.0. To fix it, divide by 2.0.' },
  { t: 'trace', topic: '1.5', code: R`double x = 6.5;
int r = (int) (x + 0.5);
System.out.println(r);
double y = 6.49;
System.out.println((int) (y + 0.5));`, wrong: ['6\n6', '7\n7', '6\n7'], why: '6.5 + 0.5 = 7.0 → 7. 6.49 + 0.5 = 6.99 → 6. That is how the +0.5 trick rounds.' },
  { t: 'trace', topic: '1.5', code: R`int x = Integer.MAX_VALUE;
x = x + 1;
System.out.println(x < 0);`, wrong: ['false', 'Crash: ArithmeticException', 'Compile error'], why: 'Overflow does not crash. MAX_VALUE + 1 wraps around to MIN_VALUE, which is negative.' },
  { t: 'fill', topic: '1.5', task: 'Print the exact average 3.5 of a and b.', code: R`int a = 3;
int b = 4;
double avg = ____;
System.out.println(avg);`, opts: ['(a + b) / 2.0', '(a + b) / 2', '(double) ((a + b) / 2)', 'a + b / 2.0'], expect: '3.5', why: 'You need a double inside the division. (a + b) / 2.0 works. The others either do integer division first or divide only b (order of operations).' },
  { t: 'mc', topic: '1.5', q: 'Which line will NOT compile?', answer: 'int n = 4.0;', wrong: ['double d = 4;', 'int n = (int) 4.7;', 'double d = 4 / 3;'], why: 'Java will automatically widen int → double, but never narrows double → int without a cast. 4.0 is a double.', fails: 'int n = 4.0;', oks: ['double d = 4;', 'int n = (int) 4.7;', 'double d = 4 / 3;'] },

  // ===== 1.6 =====
  { t: 'trace', topic: '1.6', code: R`int x = 6;
x += 4;
x *= 3;
x -= 5;
x /= 4;
System.out.println(x);`, wrong: ['6.25', '7', '5'], why: '6 → 10 → 30 → 25 → 25 / 4 = 6 (integer division).' },
  { t: 'trace', topic: '1.6', code: R`int count = 0;
count++;
count++;
count--;
count += 10;
count %= 4;
System.out.println(count);`, wrong: ['11', '2', '1'], why: '0 → 1 → 2 → 1 → 11 → 11 % 4 = 3.' },
  { t: 'mc', topic: '1.6', q: 'After this code runs, what is the value of total?', code: R`int total = 5;
total *= 2 + 3;`, answer: '25', wrong: ['13', '10', '15'], why: 'The whole right side is computed first: 2 + 3 = 5. Then total = total * 5 = 25. It is NOT total * 2 + 3.', verify: R`int total = 5;
total *= 2 + 3;
System.out.println(total);` },

  // ===== 1.9 methods =====
  { t: 'trace', topic: '1.9', code: R`public class Main {
    public static int triple(int n) {
        return n * 3;
    }

    public static void main(String[] args) {
        int a = triple(2);
        int b = triple(a + 1);
        System.out.println(a + " " + b);
    }
}`, wrong: ['6 7', '6 9', '2 21'], why: 'triple(2) = 6. Then a + 1 = 7 is passed in, so triple(7) = 21.' },
  { t: 'trace', topic: '1.9', code: R`public class Main {
    public static void change(int x) {
        x = 100;
    }

    public static void main(String[] args) {
        int x = 5;
        change(x);
        System.out.println(x);
    }
}`, wrong: ['100', '105', 'Compile error'], why: 'The method gets a COPY of 5 in its own x. Setting that copy to 100 does nothing to main\'s x. Same name, different variable.' },
  { t: 'trace', topic: '1.9', code: R`public class Main {
    public static int mystery(int a, int b) {
        if (a > b) {
            return a - b;
        }
        return b - a;
    }

    public static void main(String[] args) {
        System.out.println(mystery(3, 8));
        System.out.println(mystery(8, 3));
    }
}`, wrong: ['-5\n5', '5\n-5', '-5\n-5'], why: 'return ends the method right away. mystery always returns the distance between a and b, so both are 5.' },
  { t: 'trace', topic: '1.9', code: R`public class Main {
    public static void show(int n) {
        System.out.print(n * 2 + " ");
    }

    public static void main(String[] args) {
        show(1);
        show(3);
        System.out.println("done");
    }
}`, wrong: ['1 3 done', '2\n6\ndone', 'done'], why: 'show prints n * 2 followed by a space, staying on the same line. Then println prints done.' },
  { t: 'mc', topic: '1.9', q: 'What is the signature of this method?', code: R`public static double average(int a, int b)`, answer: 'average(int, int)', wrong: ['double average(int a, int b)', 'average(int a, int b)', 'public static double average'], why: 'A signature is the method name plus the parameter TYPES in order. The return type, modifiers and parameter names are not part of it.' },
  { t: 'mc', topic: '1.9', q: 'In the call greet("Ana"), what is "Ana"?', answer: 'An argument (actual parameter)', wrong: ['A formal parameter', 'The return value', 'The method signature'], why: 'Arguments are the values you pass in a call. Formal parameters are the variables in the method header that receive them.' },
  { t: 'bug', topic: '1.9', task: 'half(9) should return 4.5.', code: R`public class Main {
    public static double half(int n) {
        return n / 2;
    }

    public static void main(String[] args) {
        System.out.println(half(9));
    }
}`, bug: 3, fix: '        return n / 2.0;', expect: '4.5', why: 'n / 2 is int / int = 4, which becomes 4.0 when returned. Dividing by 2.0 keeps the decimal.' },

  // ===== 1.11 Math =====
  { t: 'trace', topic: '1.11', code: R`System.out.println(Math.pow(3, 2));
System.out.println(Math.abs(-7));
System.out.println(Math.sqrt(16) + 1);`, wrong: ['9\n7\n5', '6.0\n7\n5.0', '9.0\n7.0\n5.0'], why: 'pow and sqrt always return a double (9.0, 5.0). abs keeps the type it was given: an int in, an int out.' },
  { t: 'mc', topic: '1.11', q: 'Which expression gives a random int from 5 to 10, inclusive?', answer: '(int) (Math.random() * 6) + 5', wrong: ['(int) (Math.random() * 10) + 5', '(int) (Math.random() * 5) + 5', '(int) Math.random() * 6 + 5'], why: 'Range size is max - min + 1 = 6. Math.random() * 6 is 0 to 5.999, cast gives 0 to 5, then +5 shifts to 5 to 10. The last option casts too early and is always 5.' },
  { t: 'mc', topic: '1.11', q: 'What are the possible values of x?', code: R`int x = (int) (Math.random() * 4) + 2;`, answer: '2, 3, 4, 5', wrong: ['2, 3, 4, 5, 6', '0, 1, 2, 3', '2, 3, 4'], why: 'Math.random() * 4 is 0 up to (not including) 4. Cast: 0 to 3. Plus 2: 2 to 5.' },
  { t: 'trace', topic: '1.11', code: R`int a = -3;
int b = 4;
double r = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
System.out.println(r);`, wrong: ['5', '1.0', '7.0'], why: 'Inner calls first: 9.0 + 16.0 = 25.0, sqrt is 5.0. Squaring a negative makes it positive.' },

  // ===== 1.12 objects =====
  { t: 'mc', topic: '1.12', q: 'What does a reference variable like Turtle t actually store?', answer: 'The address of where the object lives in memory', wrong: ['A copy of all the object\'s data', 'The class blueprint', 'The object\'s toString() text'], why: 'Primitives store values directly. Object variables store a reference (an address). That is why two variables can point at the same object.' },
  { t: 'trace', topic: '1.12', code: R`String s = null;
System.out.println("start");
System.out.println(s.length());
System.out.println("end");`, wrong: ['start\n0\nend', 'start\nnull\nend', 'Compile error'], why: 'It compiles fine. At run time, calling length() on null crashes with a NullPointerException, so "end" never prints. The answer shows the crash.' },
  { t: 'mc', topic: '1.12', q: 'Which call is a class (static) method call?', answer: 'Math.abs(-2)', wrong: ['yertle.forward()', 'name.length()', 'myTurtle.getWidth()'], why: 'Static methods are called on the class name. The others are called on an object, so they are instance methods.' },
  { t: 'mc', topic: '1.12', q: 'A class has constructors Dog() and Dog(String name, int age). Which line will NOT compile?', answer: 'Dog d = new Dog(3, "Rex");', wrong: ['Dog d = new Dog();', 'Dog d = new Dog("Rex", 3);', 'Dog d = null;'], why: 'Arguments must match a constructor\'s parameters in number, type AND order. There is no Dog(int, String).' },
  { t: 'mc', topic: '1.12', q: 'What is the relationship between a class and an object?', answer: 'An object is one instance built from the class blueprint', wrong: ['A class is one instance built from an object', 'They are two words for the same thing', 'A class is a method inside an object'], why: 'The class defines what attributes and behaviors every object of that type has. Each object is one specific instance with its own values.' },

  // ===== 1.15 strings =====
  { t: 'trace', topic: '1.15', code: R`String s = "JAVASCRIPT";
System.out.println(s.substring(4, 7));
System.out.println(s.substring(7));`, wrong: ['SCRI\nIPT', 'ASC\nRIPT', 'SCR\nRIPT'], why: 'Index 4 is S. substring(4, 7) takes 4, 5, 6 = SCR (stops before 7). substring(7) is index 7 to the end: IPT.' },
  { t: 'trace', topic: '1.15', code: R`String s = "hello";
System.out.println(s.indexOf("l") + s.indexOf("x"));`, wrong: ['2', '1x', '3'], why: 'indexOf("l") is 2 (first match). indexOf("x") is -1 (not found). 2 + -1 = 1.' },
  { t: 'trace', topic: '1.15', code: R`String s = "code";
s.toUpperCase();
System.out.println(s);
String t = s.toUpperCase();
System.out.println(t + s.length());`, wrong: ['CODE\nCODE4', 'code\nCODE', 'CODE\nCODE5'], why: 'Strings never change. The first toUpperCase() makes a new String and throws it away, so s is still "code". t stores the new one.' },
  { t: 'trace', topic: '1.15', code: R`String s = "abc";
System.out.println(s.substring(1, 4));`, wrong: ['bc', 'abc', 'c'], why: 'Indexes in "abc" go 0 to 2, and length is 3. Asking for up to 4 is past the end, so it crashes with StringIndexOutOfBoundsException.' },
  { t: 'trace', topic: '1.15', code: R`String a = "cat";
String b = "car";
System.out.println(a.compareTo(b) > 0);
System.out.println(b.compareTo("car") == 0);`, wrong: ['false\ntrue', 'true\nfalse', 'false\nfalse'], why: '"cat" vs "car": first difference is t vs r. t comes after r, so a.compareTo(b) is positive. Same text compares to 0.' },
  { t: 'fill', topic: '1.15', task: 'Print the last letter of word (should print "n").', code: R`String word = "python";
System.out.println(____);`, opts: ['word.substring(word.length() - 1)', 'word.substring(word.length())', 'word.substring(word.length() - 1, word.length() + 1)', 'word.substring(5, 5)'], expect: 'n', why: 'The last index is length() - 1. substring(length() - 1) goes from there to the end: one letter.' },

  // ===== 2.1 =====
  { t: 'mc', topic: '2.1', q: 'An algorithm says: "Read a number. If it is negative, make it positive. Repeat until the user enters 0." Which building blocks does it use?', answer: 'Sequencing, selection, and repetition', wrong: ['Only selection', 'Selection and repetition, but no sequencing', 'Only sequencing and repetition'], why: 'Steps in order = sequencing. "If negative" = selection. "Repeat until 0" = repetition. Every algorithm with any steps uses sequencing.' },
  { t: 'mc', topic: '2.1', q: 'In a flowchart, what shape shows a yes/no decision (selection)?', answer: 'A diamond', wrong: ['A rectangle', 'An oval', 'An arrow pointing backwards'], why: 'Diamonds are decisions. Rectangles are actions, ovals are start/end, and an arrow looping back shows repetition.' },
  { t: 'trace', topic: '2.1', code: R`int x = 10;
x = x - 4;
x = x / 2;
System.out.println(x);
int y = 10;
y = y / 2;
y = y - 4;
System.out.println(y);`, wrong: ['3\n3', '1\n3', '3\n4'], why: 'Same two steps, different order. (10 - 4) / 2 = 3, but 10 / 2 - 4 = 1. Sequencing matters.' },

  // ===== 2.2 =====
  { t: 'trace', topic: '2.2', code: R`int score = 70;
System.out.println(score > 70);
System.out.println(score >= 70);
System.out.println(score != 70);`, wrong: ['true\ntrue\nfalse', 'false\nfalse\nfalse', 'false\ntrue\ntrue'], why: 'Boundary check: 70 > 70 is false, 70 >= 70 is true, and 70 != 70 is false.' },
  { t: 'trace', topic: '2.2', code: R`int a = 4;
int b = 9;
boolean r = a * 2 > b - 2;
System.out.println(r);`, wrong: ['false', 'Compile error', '8 > 7'], why: 'Math first: 8 > 7, which is true. r stores the boolean result.' },
  { t: 'trace', topic: '2.2', code: R`String x = "yes";
String y = new String("yes");
System.out.println(x == y);
System.out.println(x.equals(y));`, wrong: ['true\ntrue', 'false\nfalse', 'true\nfalse'], why: 'new String makes a separate object, so == (same object?) is false. .equals compares the text, which matches.' },
  { t: 'mc', topic: '2.2', q: 'What is the correct way to check if String name holds "Sam"?', answer: 'name.equals("Sam")', wrong: ['name == "Sam"', 'name = "Sam"', 'name.compareTo("Sam")'], why: '== compares memory addresses and can fail even when the text matches. = is assignment. compareTo returns an int, not a boolean.' },
  { t: 'mc', topic: '2.2', q: 'Why does if (x = 5) fail to compile in Java?', answer: 'x = 5 is an assignment that produces an int, and if needs a boolean', wrong: ['You cannot use numbers inside an if', 'It should be if (x := 5)', 'It compiles fine but always runs'], why: 'An if condition must be a boolean. = stores a value. == compares.' },

  // ===== 2.3 =====
  { t: 'trace', topic: '2.3', code: R`int n = 15;
if (n % 3 == 0) {
    System.out.println("Fizz");
} else if (n % 5 == 0) {
    System.out.println("Buzz");
} else {
    System.out.println(n);
}`, wrong: ['Fizz\nBuzz', 'Buzz', 'FizzBuzz'], why: 'In an else-if chain only the first true branch runs. 15 % 3 == 0 is true, so Fizz prints and the rest is skipped, even though 15 % 5 == 0 is also true.' },
  { t: 'trace', topic: '2.3', code: R`int n = 15;
if (n % 3 == 0) {
    System.out.println("Fizz");
}
if (n % 5 == 0) {
    System.out.println("Buzz");
}`, wrong: ['Fizz', 'Buzz', 'FizzBuzz'], why: 'Two separate ifs: each one is checked on its own. Both conditions are true, so both print (on separate lines).' },
  { t: 'trace', topic: '2.3', code: R`int temp = 50;
if (temp > 60) {
    System.out.println("warm");
}
System.out.println("done");`, wrong: ['warm\ndone', 'warm', 'Nothing is printed'], why: '50 > 60 is false, so the body is skipped. Code after the closing brace always runs.' },
  { t: 'trace', topic: '2.3', code: R`int x = 3;
if (x > 5);
{
    System.out.println("big");
}
System.out.println("end");`, wrong: ['end', 'Compile error', 'big'], why: 'Sneaky: the semicolon right after if (x > 5) IS the if\'s whole body (an empty statement). The braces below are just a normal block that always runs.' },
  { t: 'trace', topic: '2.3', code: R`int grade = 79;
String letter = "F";
if (grade >= 90) {
    letter = "A";
} else if (grade >= 80) {
    letter = "B";
} else if (grade >= 70) {
    letter = "C";
}
System.out.println(letter);`, wrong: ['B', 'F', 'A'], why: '79 fails >= 90 and >= 80, then passes >= 70. letter becomes C.' },
  { t: 'bug', topic: '2.3', task: 'Should print "teen" for ages 13 to 19. With age = 13 it prints "child".', code: R`int age = 13;
if (age >= 20) {
    System.out.println("adult");
} else if (age > 13) {
    System.out.println("teen");
} else {
    System.out.println("child");
}`, bug: 4, fix: '} else if (age >= 13) {', expect: 'teen', why: 'Boundary bug: 13 > 13 is false, so a 13-year-old falls through to child. Use >= 13 to include 13.' },
  { t: 'fill', topic: '2.3', task: 'Print "even" when n is even, otherwise "odd". With n = 8 it should print even.', code: R`int n = 8;
if (____) {
    System.out.println("even");
} else {
    System.out.println("odd");
}`, opts: ['n % 2 == 0', 'n / 2 == 0', 'n % 2 != 0', 'n % 2 = 0'], expect: 'even', why: 'Even numbers have remainder 0 when divided by 2. n / 2 == 0 is only true for 0 and 1. n % 2 = 0 is assignment and does not compile.' },

  // ===== 2.4 =====
  { t: 'trace', topic: '2.4', code: R`int x = 12;
int y = 3;
if (x > 10) {
    if (y > 5) {
        System.out.println("A");
    } else {
        System.out.println("B");
    }
} else {
    System.out.println("C");
}`, wrong: ['A', 'C', 'B\nC'], why: 'Outer: 12 > 10 is true, go inside. Inner: 3 > 5 is false, so the inner else prints B. The outer else is skipped.' },
  { t: 'trace', topic: '2.4', code: R`int x = 4;
if (x > 5)
    if (x > 2)
        System.out.println("one");
else
    System.out.println("two");
System.out.println("three");`, wrong: ['two\nthree', 'one\nthree', 'one\ntwo\nthree'], why: 'The else attaches to the closest if (x > 2), not to x > 5, no matter the indenting. x > 5 is false, so the whole nested part is skipped.' },
  { t: 'trace', topic: '2.4', code: R`int a = 5;
int b = 5;
if (a >= b) {
    if (a == b) {
        System.out.print("tie ");
    }
    System.out.print("a wins ");
}
System.out.println("end");`, wrong: ['tie end', 'a wins end', 'tie\na wins\nend'], why: 'Outer is true. Inner a == b is true so "tie " prints. "a wins " is inside the outer if but after the inner if, so it prints too. All on one line because of print.' },
  { t: 'trace', topic: '2.4', code: R`int roll = 20;
int armor = 5;
int dmg = 0;
if (roll >= armor * 3) {
    dmg = 12;
    if (roll >= 18) {
        dmg *= 2;
    }
    dmg -= armor;
}
System.out.println(dmg);`, wrong: ['24', '7', '0'], why: '20 >= 15 so it hits: dmg = 12. 20 >= 18 is a critical: 24. Then subtract armor: 19.' },

  // ===== 2.5 =====
  { t: 'trace', topic: '2.5', code: R`int a = 3;
int b = 7;
System.out.println(a > 2 && b < 5);
System.out.println(a > 2 || b < 5);
System.out.println(!(a == 3));`, wrong: ['true\ntrue\nfalse', 'false\nfalse\ntrue', 'false\ntrue\ntrue'], why: '&& needs both: true && false = false. || needs one: true || false = true. a == 3 is true, ! flips it to false.' },
  { t: 'trace', topic: '2.5', code: R`System.out.println(true || false && false);
System.out.println((true || false) && false);`, wrong: ['false\nfalse', 'true\ntrue', 'false\ntrue'], why: '&& is done before ||, like × before +. So the first is true || (false && false) = true. Parentheses change it in the second: true && false = false.' },
  { t: 'trace', topic: '2.5', code: R`int x = 0;
if (x != 0 && 10 / x > 1) {
    System.out.println("yes");
} else {
    System.out.println("no");
}`, wrong: ['yes', 'Crash: ArithmeticException', 'Compile error'], why: 'Short-circuit: x != 0 is false, so && stops right there and never computes 10 / x. No crash.' },
  { t: 'trace', topic: '2.5', code: R`int x = 0;
if (10 / x > 1 && x != 0) {
    System.out.println("yes");
} else {
    System.out.println("no");
}`, wrong: ['no', 'yes', 'Compile error'], why: 'Same parts, flipped order. Now 10 / x runs first and divides by zero, which crashes with ArithmeticException before the check is reached.' },
  { t: 'fill', topic: '2.5', task: 'valid should return true only for ages 13 to 19 inclusive, so this prints: false true true false', code: R`public class Main {
    public static boolean valid(int age) {
        return ____;
    }

    public static void main(String[] args) {
        System.out.println(valid(12) + " " + valid(13) + " " + valid(19) + " " + valid(20));
    }
}`, opts: ['age >= 13 && age <= 19', 'age >= 13 || age <= 19', 'age > 13 && age < 19', '13 <= age <= 19'], expect: 'false true true false', why: 'Inside a range needs both conditions (&&), with >= and <= to include the ends. || accepts every age. > and < drop 13 and 19. Java cannot chain 13 <= age <= 19.' },
  { t: 'mc', topic: '2.5', q: 'Which value of n makes (n > 10 || n % 2 == 0) false?', answer: '7', wrong: ['12', '4', '15'], why: 'An || is false only when BOTH sides are false: n must be 10 or less AND odd. Only 7 fits.', verify: R`for (int n = 4; n <= 15; n++) {
    if (n == 4 || n == 7 || n == 12 || n == 15) {
        if (!(n > 10 || n % 2 == 0)) {
            System.out.println(n);
        }
    }
}` },

  // ===== 2.6 =====
  { t: 'mc', topic: '2.6', q: 'Which is equivalent to !(x > 4 && y < 2)?', answer: 'x <= 4 || y >= 2', wrong: ['x <= 4 && y >= 2', 'x < 4 || y > 2', '!x > 4 && !y < 2'], why: "De Morgan: flip each piece and swap && for ||. The opposite of > is <= (not <), and the opposite of < is >=." },
  { t: 'mc', topic: '2.6', q: 'Which is equivalent to !(a || b)?', answer: '!a && !b', wrong: ['!a || !b', 'a && b', '!a || b'], why: '"Not (a or b)" means neither one is true: !a && !b.' },
  { t: 'mc', topic: '2.6', q: 'Which expression is equivalent to !(score < 60)?', answer: 'score >= 60', wrong: ['score > 60', 'score <= 60', 'score > 59.5 && score < 60'], why: 'The opposite of < includes the boundary: >=. Test score = 60: !(60 < 60) is true, and 60 >= 60 is true. 60 > 60 would be false, so that one does not match.' },
  { t: 'trace', topic: '2.6', code: R`int x = 6;
int y = 2;
boolean p = !(x > 5 || y > 5);
boolean q = x <= 5 && y <= 5;
System.out.println(p + " " + q + " " + (p == q));`, wrong: ['true true true', 'false true false', 'true false false'], why: 'x > 5 is true, so the || is true and p = false. q: 6 <= 5 is false, so q = false. They match, which is De Morgan in action.' },
  { t: 'mc', topic: '2.6', q: 'Two boolean expressions give the same result for 9 out of 10 test inputs. Are they equivalent?', answer: 'No, they must match for every possible input', wrong: ['Yes, 90% is close enough', 'Yes, if they use the same variables', 'Only if they are the same length'], why: 'Equivalent means interchangeable everywhere. One mismatch proves they are different.' },

  // ===== 2.7 =====
  { t: 'trace', topic: '2.7', code: R`int i = 0;
while (i < 3) {
    System.out.print(i + " ");
    i++;
}
System.out.println("| " + i);`, wrong: ['0 1 2 3 | 3', '1 2 3 | 3', '0 1 2 | 2'], why: 'Prints 0, 1, 2. When i becomes 3, the condition fails and the loop ends, so i is 3 afterwards.' },
  { t: 'trace', topic: '2.7', code: R`int n = 50;
int steps = 0;
while (n > 1) {
    n /= 2;
    steps++;
}
System.out.println(steps + " " + n);`, wrong: ['6 1', '5 0', '25 1'], why: '50 → 25 → 12 → 6 → 3 → 1. That is 5 halvings, then 1 > 1 is false.' },
  { t: 'trace', topic: '2.7', code: R`int num = 905;
int count = 0;
while (num > 0) {
    num /= 10;
    count++;
}
System.out.println(count);`, wrong: ['2', '905', '4'], why: 'Each / 10 drops one digit: 905 → 90 → 9 → 0. Three passes, so it counts the digits.' },
  { t: 'trace', topic: '2.7', code: R`int x = 10;
while (x < 5) {
    System.out.println(x);
    x++;
}
System.out.println("after");`, wrong: ['10\nafter', 'Runs forever', '10\n11\n12\n13\n14\nafter'], why: 'The condition is checked before the first pass. 10 < 5 is false right away, so the body runs zero times.' },
  { t: 'trace', topic: '2.7', code: R`int num = 352;
int rev = 0;
while (num > 0) {
    rev = rev * 10 + num % 10;
    num /= 10;
}
System.out.println(rev);`, wrong: ['352', '10', '2'], why: 'Each pass moves the last digit of num onto the end of rev: 2, then 25, then 253. It reverses the number.' },
  { t: 'bug', topic: '2.7', task: 'Should print 5 4 3 2 1 and stop.', code: R`int n = 5;
while (n > 0) {
    System.out.print(n + " ");
    n++;
}`, bug: 4, fix: '    n--;', expect: '5 4 3 2 1', why: 'n++ moves n away from 0, so n > 0 stays true until overflow. The update has to move toward ending the loop.' },
  { t: 'fill', topic: '2.7', task: 'Add up the digits of 4093 (should print 16).', code: R`int num = 4093;
int sum = 0;
while (num > 0) {
    sum += ____;
    num /= 10;
}
System.out.println(sum);`, opts: ['num % 10', 'num / 10', 'num', 'num % 4093'], expect: '16', why: 'num % 10 is the last digit. Then num /= 10 drops it, so the next pass sees the next digit.' },

  // ===== 2.8 =====
  { t: 'trace', topic: '2.8', code: R`for (int i = 2; i <= 10; i += 3) {
    System.out.print(i + " ");
}`, wrong: ['2 5 8 11', '2 4 6 8 10', '3 6 9'], why: 'i = 2, 5, 8 all pass i <= 10. Then 11 fails, so it stops.' },
  { t: 'trace', topic: '2.8', code: R`int total = 0;
for (int k = 5; k > 0; k--) {
    total += k;
}
System.out.println(total);`, wrong: ['10', '14', '20'], why: '5 + 4 + 3 + 2 + 1 = 15. When k reaches 0, k > 0 fails.' },
  { t: 'trace', topic: '2.8', code: R`for (int i = 0; i < 6; i++) {
    if (i % 2 == 1) {
        System.out.print(i);
    }
}
System.out.println();`, wrong: ['024', '0246', '12345'], why: 'Only odd i pass the if: 1, 3, 5. print keeps them on one line with no spaces.' },
  { t: 'trace', topic: '2.8', code: R`int x = 1;
for (int i = 1; i <= 4; i++) {
    x *= 2;
}
System.out.println(x);`, wrong: ['8', '32', '4'], why: 'Four passes, doubling each time: 2, 4, 8, 16.' },
  { t: 'mc', topic: '2.8', q: 'How many times does the body of this loop run?', code: R`for (int i = 4; i <= 19; i++)`, answer: '16', wrong: ['15', '19', '17'], why: 'For i = a to b with <=, the count is b - a + 1 = 19 - 4 + 1 = 16.', verify: R`int c = 0;
for (int i = 4; i <= 19; i++) { c++; }
System.out.println(c);` },
  { t: 'bug', topic: '2.8', task: 'Should print 1 2 3 4 5.', code: R`for (int i = 1; i < 5; i++) {
    System.out.print(i + " ");
}`, bug: 1, fix: 'for (int i = 1; i <= 5; i++) {', expect: '1 2 3 4 5', why: 'Off by one: i < 5 stops at 4. Use i <= 5 (or i < 6) to include 5.' },
  { t: 'fill', topic: '2.8', task: 'Print the multiples of 5 up to 25: 5 10 15 20 25', code: R`for (int i = 5; ____; i += 5) {
    System.out.print(i + " ");
}`, opts: ['i <= 25', 'i < 25', 'i == 25', 'i <= 30'], expect: '5 10 15 20 25', why: 'i goes 5, 10, 15, 20, 25. i < 25 would stop before 25 and i <= 30 would include 30.' },
  { t: 'mc', topic: '2.8', q: 'Which while loop does exactly what this for loop does?', code: R`for (int i = 0; i < 3; i++) {
    System.out.print(i);
}`, answer: 'int i = 0; while (i < 3) { System.out.print(i); i++; }', wrong: ['int i = 0; while (i < 3) { i++; System.out.print(i); }', 'int i = 0; while (i <= 3) { System.out.print(i); i++; }', 'int i = 1; while (i < 3) { System.out.print(i); i++; }'], why: 'Init above the loop, same condition, body first, update last. Updating before printing would print 123 instead of 012.' },

  // ===== 2.9 =====
  { t: 'trace', topic: '2.9', code: R`int sum = 0;
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        sum += i;
    }
}
System.out.println(sum);`, wrong: ['55', '25', '20'], why: 'Adds only the evens: 2 + 4 + 6 + 8 + 10 = 30.' },
  { t: 'trace', topic: '2.9', code: R`int count = 0;
for (int n = 1; n <= 30; n++) {
    if (n % 4 == 0 || n % 6 == 0) {
        count++;
    }
}
System.out.println(count);`, wrong: ['12', '5', '7'], why: 'Multiples of 4: 7 of them (4 to 28). Multiples of 6: 5 (6 to 30). Overlap (12, 24) counted once: 7 + 5 - 2 = 10.' },
  { t: 'trace', topic: '2.9', code: R`int product = 1;
for (int i = 1; i <= 5; i++) {
    product *= i;
}
System.out.println(product);`, wrong: ['15', '0', '24'], why: '1 × 2 × 3 × 4 × 5 = 120 (5 factorial). A product starts at 1, not 0, or everything would be 0.' },
  { t: 'trace', topic: '2.9', code: R`int min = Integer.MAX_VALUE;
int a = 8, b = 3, c = 5;
if (a < min) { min = a; }
if (b < min) { min = b; }
if (c < min) { min = c; }
System.out.println(min);`, wrong: ['5', '8', '2147483647'], why: 'Starting at the largest int guarantees the first value replaces it. Then 3 beats 8, and 5 does not beat 3.' },
  { t: 'bug', topic: '2.9', task: 'Should print the product 1×2×3×4 = 24.', code: R`int product = 0;
for (int i = 1; i <= 4; i++) {
    product *= i;
}
System.out.println(product);`, bug: 1, fix: 'int product = 1;', expect: '24', why: 'Anything times 0 is 0. A product accumulator must start at 1.' },
  { t: 'fill', topic: '2.9', task: 'Count the numbers from 1 to 50 that are divisible by 7 (should print 7).', code: R`int count = 0;
for (int n = 1; n <= 50; n++) {
    if (____) {
        count++;
    }
}
System.out.println(count);`, opts: ['n % 7 == 0', 'n / 7 == 0', 'n % 7 == 1', 'n == 7'], expect: '7', why: 'Divisible by 7 means remainder 0. Those are 7, 14, ..., 49: seven numbers.' },
  { t: 'trace', topic: '2.9', code: R`int n = 12;
for (int d = 1; d <= n; d++) {
    if (n % d == 0) {
        System.out.print(d + " ");
    }
}
System.out.println();`, wrong: ['2 3 4 6', '1 2 3 4 6', '12 6 4 3 2 1'], why: 'Prints every d that divides 12 evenly, from 1 up to 12 itself: all the factors.' },

  // ===== 2.10 =====
  { t: 'trace', topic: '2.10', code: R`String s = "loop";
String out = "";
for (int i = 0; i < s.length(); i++) {
    out = s.substring(i, i + 1) + out;
}
System.out.println(out);`, wrong: ['loop', 'opol', 'p'], why: 'Each new letter goes in FRONT of what we have so far: l, ol, ool, pool. It reverses the word.' },
  { t: 'trace', topic: '2.10', code: R`String s = "banana";
int count = 0;
for (int i = 0; i < s.length(); i++) {
    if (s.substring(i, i + 1).equals("a")) {
        count++;
    }
}
System.out.println(count);`, wrong: ['2', '6', '1'], why: 'Checks each letter: a appears at indexes 1, 3, 5. Three times.' },
  { t: 'trace', topic: '2.10', code: R`String s = "computer";
String result = "";
for (int i = 0; i < s.length(); i += 2) {
    result += s.substring(i, i + 1);
}
System.out.println(result);`, wrong: ['optr', 'cmpt', 'computer'], why: 'i = 0, 2, 4, 6: letters c, m, u, e. Every other letter starting at 0.' },
  { t: 'trace', topic: '2.10', code: R`String s = "hi";
for (int i = 0; i <= s.length(); i++) {
    System.out.print(s.substring(i, i + 1));
}`, wrong: ['hi', 'h\ni', 'Crash: StringIndexOutOfBoundsException'], why: 'With <= the loop tries i = 2, and substring(2, 3) is past the end of "hi". It prints h and i, then crashes with StringIndexOutOfBoundsException.' },
  { t: 'trace', topic: '2.10', code: R`String s = "a,b,,c";
int pos = s.indexOf(",");
int count = 0;
while (pos >= 0) {
    count++;
    s = s.substring(pos + 1);
    pos = s.indexOf(",");
}
System.out.println(count + " " + s);`, wrong: ['3 ,c', '2 c', '4 c'], why: 'Each pass removes everything up to and including the next comma. There are 3 commas, and the last chop leaves "c".' },
  { t: 'bug', topic: '2.10', task: 'Should count the vowels in "education" (5).', code: R`String word = "education";
String vowels = "aeiou";
int count = 0;
for (int i = 0; i < word.length(); i++) {
    String ch = word.substring(i, i + 1);
    if (vowels.indexOf(ch) > 0) {
        count++;
    }
}
System.out.println(count);`, bug: 6, fix: '    if (vowels.indexOf(ch) >= 0) {', expect: '5', why: 'indexOf returns 0 when the letter is "a" (it is at index 0 of "aeiou"). Not found is -1, so the test must be >= 0 (or != -1).' },
  { t: 'fill', topic: '2.10', task: 'Print each letter of "abc" on its own line.', code: R`String s = "abc";
for (int i = 0; i < s.length(); i++) {
    System.out.println(____);
}`, opts: ['s.substring(i, i + 1)', 's.substring(i)', 's.substring(i, i)', 's.substring(0, i)'], expect: 'a\nb\nc', why: 'substring(i, i + 1) is exactly one letter. substring(i) is everything from i on, and substring(i, i) is empty.' },

  // ===== 2.11 =====
  { t: 'trace', topic: '2.11', code: R`for (int i = 1; i <= 2; i++) {
    for (int j = 1; j <= 3; j++) {
        System.out.print(i * j + " ");
    }
    System.out.println();
}`, wrong: ['1 2 3 2 4 6', '1 2\n2 4\n3 6', '1 1 1\n2 2 2'], why: 'For i = 1, j runs 1 to 3: 1 2 3. New line. For i = 2: 2 4 6.' },
  { t: 'trace', topic: '2.11', code: R`for (int i = 3; i >= 1; i--) {
    for (int j = 0; j < i; j++) {
        System.out.print("#");
    }
    System.out.println();
}`, wrong: ['#\n##\n###', '###\n###\n###', '###\n##'], why: 'Inner loop runs i times. i goes 3, 2, 1, so rows have 3, 2, 1 #s.' },
  { t: 'trace', topic: '2.11', code: R`int count = 0;
for (int i = 0; i < 4; i++) {
    for (int j = i; j < 4; j++) {
        count++;
    }
}
System.out.println(count);`, wrong: ['16', '4', '6'], why: 'j starts at i each time: i = 0 → 4 passes, i = 1 → 3, i = 2 → 2, i = 3 → 1. 4 + 3 + 2 + 1 = 10.' },
  { t: 'trace', topic: '2.11', code: R`for (int r = 1; r <= 3; r++) {
    String line = "";
    for (int c = 1; c <= r; c++) {
        line += c;
    }
    System.out.println(line);
}`, wrong: ['1\n2\n3', '123\n123\n123', '1\n12'], why: 'line resets to "" every row. Row r builds 1..r: "1", "12", "123".' },
  { t: 'fill', topic: '2.11', task: 'Print a 2-row by 4-column rectangle of *.', code: R`for (int row = 0; row < 2; row++) {
    for (int col = 0; col < 4; col++) {
        System.out.print("*");
    }
    ____
}`, opts: ['System.out.println();', 'System.out.print("*");', 'row++;', 'col = 0;'], expect: '****\n****', why: 'After the inner loop finishes a row, println() moves to the next line. Without it, all 8 stars would be on one line.' },

  // ===== 2.12 =====
  { t: 'mc', topic: '2.12', q: 'How many times does count++ execute?', code: R`for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 3; j++) {
        count++;
    }
}`, answer: '15', wrong: ['8', '5', '18'], why: 'The inner loop runs 3 times for each of the 5 outer passes: 5 × 3 = 15.', verify: R`int count = 0;
for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 3; j++) {
        count++;
    }
}
System.out.println(count);` },
  { t: 'mc', topic: '2.12', q: 'How many times does the body run?', code: R`for (int k = 1; k < 64; k *= 2)`, answer: '6', wrong: ['64', '32', '7'], why: 'k = 1, 2, 4, 8, 16, 32. Next would be 64, which fails k < 64. Six passes.', verify: R`int c = 0;
for (int k = 1; k < 64; k *= 2) { c++; }
System.out.println(c);` },
  { t: 'mc', topic: '2.12', q: 'How many times does x++ execute?', code: R`for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= i; j++) {
        x++;
    }
}`, answer: '15', wrong: ['25', '5', '10'], why: 'Row i runs i times: 1 + 2 + 3 + 4 + 5 = 15.', verify: R`int x = 0;
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= i; j++) {
        x++;
    }
}
System.out.println(x);` },
  { t: 'mc', topic: '2.12', q: 'How many times does the body run?', code: R`for (int i = 10; i > 0; i -= 3)`, answer: '4', wrong: ['3', '10', '5'], why: 'i = 10, 7, 4, 1 all pass i > 0. Next is -2, which fails. Four passes.', verify: R`int c = 0;
for (int i = 10; i > 0; i -= 3) { c++; }
System.out.println(c);` },
  { t: 'mc', topic: '2.12', q: 'How many times is the condition i < 4 checked in total?', code: R`for (int i = 0; i < 4; i++)`, answer: '5', wrong: ['4', '3', '1'], why: 'It is checked before each of the 4 passes, plus once more when i = 4 and it finally fails. Loop runs n times, condition checks n + 1 times.', verify: R`int checks = 0;
int i = 0;
while (true) {
    checks++;
    if (!(i < 4)) { break; }
    i++;
}
System.out.println(checks);` },
];

const PRESETS = [
  { name: 'Digit sum (while)', code: R`int num = 4721;
int sum = 0;
while (num > 0) {
    sum += num % 10;
    num /= 10;
}
System.out.println(sum);` },
  { name: 'FizzBuzz 1 to 15', code: R`for (int i = 1; i <= 15; i++) {
    if (i % 3 == 0 && i % 5 == 0) {
        System.out.println("FizzBuzz");
    } else if (i % 3 == 0) {
        System.out.println("Fizz");
    } else if (i % 5 == 0) {
        System.out.println("Buzz");
    } else {
        System.out.println(i);
    }
}` },
  { name: 'Reverse a word', code: R`String s = "racecar";
String rev = "";
for (int i = 0; i < s.length(); i++) {
    rev = s.substring(i, i + 1) + rev;
}
System.out.println(rev);
System.out.println(rev.equals(s));` },
  { name: 'Methods and return', code: R`public class Main {
    public static int max(int a, int b) {
        if (a > b) {
            return a;
        }
        return b;
    }

    public static void main(String[] args) {
        int best = max(4, 9);
        best = max(best, 7);
        System.out.println(best);
    }
}` },
  { name: 'Star triangle (nested)', code: R`for (int i = 1; i <= 4; i++) {
    for (int j = 1; j <= i; j++) {
        System.out.print("*");
    }
    System.out.println();
}` },
  { name: 'Blank', code: R`int x = 5;
System.out.println(x);` },
];

if (typeof module !== 'undefined') module.exports = { TOPICS, QUESTIONS, PRESETS };
