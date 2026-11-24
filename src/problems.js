// Write It problems. Expected outputs are computed by build.js from the reference solution run in real Java.
// kind 'return': each test prints the call's return value. kind 'print': each test runs the call and compares what it prints.
const W = String.raw;

const PROBLEMS = [
  // ---------- Unit 1 ----------
  { id: 'average3', topic: '1.3', title: 'Average of three', kind: 'return',
    prompt: 'Return the average of the three ints as a double, with the decimal kept. <code>average(1, 2, 2)</code> should be 1.666..., not 1.',
    sig: 'public static double average(int a, int b, int c)',
    tests: ['average(1, 2, 3)', 'average(1, 2, 2)', 'average(0, 0, 1)', 'average(-3, 3, 1)', 'average(10, 10, 10)'],
    hints: ['If every value in the division is an int, Java chops the decimal before you ever store it.', 'Divide by 3.0 instead of 3, and keep the sum in parentheses.'],
    solution: W`public static double average(int a, int b, int c) {
    return (a + b + c) / 3.0;
}`,
    wrong: [W`public static double average(int a, int b, int c) {
    return (a + b + c) / 3;
}`, W`public static double average(int a, int b, int c) {
    return a + b + c / 3.0;
}`],
    explain: '(a + b + c) adds first because of the parentheses. Dividing by 3.0 makes it double division, so the decimal survives.' },

  { id: 'formatTime', topic: '1.3', title: 'Minutes to hours', kind: 'return',
    prompt: 'Given a number of minutes, return a String like <code>"2 hr 15 min"</code>. <code>formatTime(135)</code> returns <code>"2 hr 15 min"</code> and <code>formatTime(45)</code> returns <code>"0 hr 45 min"</code>.',
    sig: 'public static String formatTime(int minutes)',
    tests: ['formatTime(135)', 'formatTime(45)', 'formatTime(60)', 'formatTime(0)', 'formatTime(1000)'],
    hints: ['Integer division by 60 gives the whole hours.', 'The remainder (% 60) gives the leftover minutes.'],
    solution: W`public static String formatTime(int minutes) {
    int hours = minutes / 60;
    int mins = minutes % 60;
    return hours + " hr " + mins + " min";
}`,
    wrong: [W`public static String formatTime(int minutes) {
    return minutes % 60 + " hr " + minutes / 60 + " min";
}`, W`public static String formatTime(int minutes) {
    return minutes / 60.0 + " hr " + minutes % 60 + " min";
}`],
    explain: '/ 60 with ints gives whole hours and % 60 gives what is left over. This divide-and-remainder pair shows up all over the AP exam (also for digits, cents, seconds).' },

  { id: 'roundHalfUp', topic: '1.5', title: 'Round to the nearest int', kind: 'return',
    prompt: 'Return <code>x</code> rounded to the nearest int, rounding .5 up. You can assume <code>x</code> is not negative. Use a cast, not Math.round.',
    sig: 'public static int roundHalfUp(double x)',
    tests: ['roundHalfUp(3.8)', 'roundHalfUp(3.2)', 'roundHalfUp(3.5)', 'roundHalfUp(0.49)', 'roundHalfUp(10.0)'],
    hints: ['(int) chops the decimal off. It never rounds.', 'Add 0.5 first, then cast the whole thing: (int) (x + 0.5).'],
    solution: W`public static int roundHalfUp(double x) {
    return (int) (x + 0.5);
}`,
    wrong: [W`public static int roundHalfUp(double x) {
    return (int) x;
}`, W`public static int roundHalfUp(double x) {
    return (int) x + 1;
}`],
    explain: 'Adding 0.5 pushes anything at .5 or above past the next whole number, and the cast then chops the decimal.' },

  { id: 'totalSeconds', topic: '1.9', title: 'Total seconds', kind: 'return',
    prompt: 'Return how many seconds are in <code>h</code> hours, <code>m</code> minutes and <code>s</code> seconds. <code>totalSeconds(1, 2, 3)</code> is 3723.',
    sig: 'public static int totalSeconds(int h, int m, int s)',
    tests: ['totalSeconds(1, 2, 3)', 'totalSeconds(0, 0, 0)', 'totalSeconds(0, 5, 0)', 'totalSeconds(2, 0, 30)'],
    hints: ['One hour is 3600 seconds and one minute is 60.'],
    solution: W`public static int totalSeconds(int h, int m, int s) {
    return h * 3600 + m * 60 + s;
}`,
    wrong: [W`public static int totalSeconds(int h, int m, int s) {
    return h * 60 + m * 60 + s;
}`],
    explain: 'Convert each part to seconds and add. * happens before +, so no parentheses are needed.' },

  { id: 'hypotenuse', topic: '1.11', title: 'Hypotenuse', kind: 'return',
    prompt: 'Return the length of the hypotenuse of a right triangle with legs <code>a</code> and <code>b</code> (the square root of a² + b²).',
    sig: 'public static double hypotenuse(double a, double b)',
    tests: ['hypotenuse(3, 4)', 'hypotenuse(5, 12)', 'hypotenuse(1, 1)', 'hypotenuse(0, 7)'],
    hints: ['Math.sqrt(x) is the square root. Math.pow(a, 2) or a * a squares a.'],
    solution: W`public static double hypotenuse(double a, double b) {
    return Math.sqrt(a * a + b * b);
}`,
    wrong: [W`public static double hypotenuse(double a, double b) {
    return Math.sqrt(a + b);
}`, W`public static double hypotenuse(double a, double b) {
    return Math.pow(a, 2) + Math.pow(b, 2);
}`],
    explain: 'Square each leg, add, then take the square root. The inner part runs first, then Math.sqrt.' },

  { id: 'initials', topic: '1.15', title: 'Initials', kind: 'return',
    prompt: 'Return the first letter of <code>first</code> followed by the first letter of <code>last</code>. <code>initials("Dylan", "Harris")</code> returns <code>"DH"</code>.',
    sig: 'public static String initials(String first, String last)',
    tests: ['initials("Dylan", "Harris")', 'initials("ada", "lovelace")', 'initials("X", "Y")'],
    hints: ['substring(0, 1) gives the first letter of a String.'],
    solution: W`public static String initials(String first, String last) {
    return first.substring(0, 1) + last.substring(0, 1);
}`,
    wrong: [W`public static String initials(String first, String last) {
    return first.substring(1) + last.substring(1);
}`],
    explain: 'substring(0, 1) takes index 0 and stops before index 1, so it is exactly one letter.' },

  { id: 'firstAndLast', topic: '1.15', title: 'First and last letter', kind: 'return',
    prompt: 'Return a String made of the first and last letter of <code>s</code>. <code>s</code> has at least one letter. <code>firstAndLast("java")</code> returns <code>"ja"</code> and <code>firstAndLast("a")</code> returns <code>"aa"</code>.',
    sig: 'public static String firstAndLast(String s)',
    tests: ['firstAndLast("java")', 'firstAndLast("hello")', 'firstAndLast("a")', 'firstAndLast("ok")'],
    hints: ['The last index is s.length() - 1.', 's.substring(s.length() - 1) is the last letter.'],
    solution: W`public static String firstAndLast(String s) {
    return s.substring(0, 1) + s.substring(s.length() - 1);
}`,
    wrong: [W`public static String firstAndLast(String s) {
    return s.substring(0, 1) + s.substring(s.length());
}`, W`public static String firstAndLast(String s) {
    return s.substring(0, 1) + s.substring(s.length() - 1, s.length() + 1);
}`],
    explain: 'Indexes run 0 to length() - 1. substring(length() - 1) starts at the last index and goes to the end, which is one letter.' },

  { id: 'removeFirst', topic: '1.15', title: 'Remove the first match', kind: 'return',
    prompt: 'Return <code>s</code> with the first occurrence of <code>part</code> removed. If <code>part</code> is not in <code>s</code>, return <code>s</code> unchanged. <code>removeFirst("banana", "an")</code> returns <code>"bana"</code>.',
    sig: 'public static String removeFirst(String s, String part)',
    tests: ['removeFirst("banana", "an")', 'removeFirst("hello", "x")', 'removeFirst("aaa", "a")', 'removeFirst("abc", "abc")', 'removeFirst("racecar", "car")'],
    hints: ['indexOf tells you where part starts, or -1 if it is not there.', 'Keep everything before that index, then everything starting at index + part.length().'],
    solution: W`public static String removeFirst(String s, String part) {
    int i = s.indexOf(part);
    if (i == -1) {
        return s;
    }
    return s.substring(0, i) + s.substring(i + part.length());
}`,
    wrong: [W`public static String removeFirst(String s, String part) {
    int i = s.indexOf(part);
    return s.substring(0, i) + s.substring(i + part.length());
}`, W`public static String removeFirst(String s, String part) {
    int i = s.indexOf(part);
    if (i == -1) {
        return s;
    }
    return s.substring(0, i) + s.substring(i + 1);
}`],
    explain: 'Check for -1 first, or substring(0, -1) crashes. Then glue the part before the match to the part after it. The "after" part starts at i + part.length() because part may be more than one letter.' },

  // ---------- Unit 2 ----------
  { id: 'letterGrade', topic: '2.3', title: 'Letter grade', kind: 'return',
    prompt: 'Return <code>"A"</code> for 90 and up, <code>"B"</code> for 80 to 89, <code>"C"</code> for 70 to 79, <code>"D"</code> for 60 to 69, and <code>"F"</code> below 60.',
    sig: 'public static String letterGrade(int score)',
    tests: ['letterGrade(95)', 'letterGrade(90)', 'letterGrade(89)', 'letterGrade(70)', 'letterGrade(60)', 'letterGrade(59)', 'letterGrade(0)'],
    hints: ['Use an if / else if chain. Only the first true branch runs.', 'Check from the top (>= 90) down, using >= so the boundaries are included.'],
    solution: W`public static String letterGrade(int score) {
    if (score >= 90) {
        return "A";
    } else if (score >= 80) {
        return "B";
    } else if (score >= 70) {
        return "C";
    } else if (score >= 60) {
        return "D";
    }
    return "F";
}`,
    wrong: [W`public static String letterGrade(int score) {
    if (score > 90) {
        return "A";
    } else if (score > 80) {
        return "B";
    } else if (score > 70) {
        return "C";
    } else if (score > 60) {
        return "D";
    }
    return "F";
}`, W`public static String letterGrade(int score) {
    if (score >= 60) {
        return "D";
    } else if (score >= 70) {
        return "C";
    } else if (score >= 80) {
        return "B";
    } else if (score >= 90) {
        return "A";
    }
    return "F";
}`],
    explain: 'Going from highest to lowest means each else if only sees scores that already failed the checks above it. Using >= includes the exact boundary (90 is an A).' },

  { id: 'maxOfThree', topic: '2.4', title: 'Biggest of three', kind: 'return',
    prompt: 'Return the largest of <code>a</code>, <code>b</code> and <code>c</code>. Use if statements, not Math.max.',
    sig: 'public static int maxOfThree(int a, int b, int c)',
    tests: ['maxOfThree(1, 2, 3)', 'maxOfThree(3, 2, 1)', 'maxOfThree(2, 3, 1)', 'maxOfThree(3, 1, 5)', 'maxOfThree(5, 5, 1)', 'maxOfThree(-1, -2, -3)'],
    hints: ['Keep a variable for the biggest so far. Start it at a.', 'Compare b to it, then c to it, replacing it when you find something bigger.'],
    solution: W`public static int maxOfThree(int a, int b, int c) {
    int max = a;
    if (b > max) {
        max = b;
    }
    if (c > max) {
        max = c;
    }
    return max;
}`,
    wrong: [W`public static int maxOfThree(int a, int b, int c) {
    if (a > b) {
        return a;
    }
    if (b > c) {
        return b;
    }
    return c;
}`, W`public static int maxOfThree(int a, int b, int c) {
    int max = 0;
    if (a > max) {
        max = a;
    }
    if (b > max) {
        max = b;
    }
    if (c > max) {
        max = c;
    }
    return max;
}`],
    explain: 'The "best so far" pattern: start with the first value and replace it whenever you see a bigger one. Starting at 0 breaks when every value is negative.' },

  { id: 'isTeen', topic: '2.5', title: 'Is a teenager', kind: 'return',
    prompt: 'Return <code>true</code> if <code>age</code> is from 13 to 19, including 13 and 19.',
    sig: 'public static boolean isTeen(int age)',
    tests: ['isTeen(12)', 'isTeen(13)', 'isTeen(16)', 'isTeen(19)', 'isTeen(20)'],
    hints: ['Inside a range needs two comparisons joined with &&.'],
    solution: W`public static boolean isTeen(int age) {
    return age >= 13 && age <= 19;
}`,
    wrong: [W`public static boolean isTeen(int age) {
    return age > 13 && age < 19;
}`, W`public static boolean isTeen(int age) {
    return age >= 13 || age <= 19;
}`],
    explain: 'You can return a boolean expression directly. No if needed. >= and <= include the ends.' },

  { id: 'isLeapYear', topic: '2.5', title: 'Leap year', kind: 'return',
    prompt: 'A year is a leap year if it is divisible by 4, except years divisible by 100 are not, unless they are also divisible by 400. So 2024 and 2000 are leap years, but 1900 is not.',
    sig: 'public static boolean isLeapYear(int year)',
    tests: ['isLeapYear(2024)', 'isLeapYear(2023)', 'isLeapYear(1900)', 'isLeapYear(2000)', 'isLeapYear(2100)'],
    hints: ['Divisible by 4 means year % 4 == 0.', 'Leap if: (divisible by 4 AND not divisible by 100) OR divisible by 400.'],
    solution: W`public static boolean isLeapYear(int year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}`,
    wrong: [W`public static boolean isLeapYear(int year) {
    return year % 4 == 0;
}`, W`public static boolean isLeapYear(int year) {
    return year % 4 == 0 && year % 100 != 0;
}`],
    explain: 'Each rule becomes one comparison, then && and || combine them. The test cases 1900 and 2000 are there to catch the two exceptions.' },

  { id: 'digitSum', topic: '2.7', title: 'Digit sum', kind: 'return',
    prompt: 'Return the sum of the digits of <code>n</code> (n is 0 or more). <code>digitSum(4721)</code> is 4 + 7 + 2 + 1 = 14.',
    sig: 'public static int digitSum(int n)',
    tests: ['digitSum(4721)', 'digitSum(0)', 'digitSum(9)', 'digitSum(1000)', 'digitSum(99999)'],
    hints: ['n % 10 is the last digit.', 'n / 10 drops the last digit. Loop while n > 0.'],
    solution: W`public static int digitSum(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}`,
    wrong: [W`public static int digitSum(int n) {
    int sum = 0;
    while (n > 10) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}`, W`public static int digitSum(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n / 10;
        n %= 10;
    }
    return sum;
}`],
    explain: 'Each pass peels off one digit: add the last digit with % 10, then remove it with / 10. When n hits 0, every digit has been added.' },

  { id: 'countDigits', topic: '2.7', title: 'Count digits', kind: 'return',
    prompt: 'Return how many digits <code>n</code> has (n is 0 or more). Careful: 0 has one digit.',
    sig: 'public static int countDigits(int n)',
    tests: ['countDigits(7)', 'countDigits(10)', 'countDigits(12345)', 'countDigits(0)'],
    hints: ['Divide by 10 until nothing is left and count the passes.', 'A plain while (n > 0) loop runs zero times for 0. Handle 0 separately.'],
    solution: W`public static int countDigits(int n) {
    if (n == 0) {
        return 1;
    }
    int count = 0;
    while (n > 0) {
        n /= 10;
        count++;
    }
    return count;
}`,
    wrong: [W`public static int countDigits(int n) {
    int count = 0;
    while (n > 0) {
        n /= 10;
        count++;
    }
    return count;
}`],
    explain: 'The loop counts how many times you can drop a digit. Zero is the edge case: the loop never runs, so you need the special case. Edge cases like this are exactly what AP scorers check.' },

  { id: 'reverseNumber', topic: '2.7', title: 'Reverse a number', kind: 'return',
    prompt: 'Return the digits of <code>n</code> in reverse order. <code>reverseNumber(1234)</code> is 4321 and <code>reverseNumber(1200)</code> is 21.',
    sig: 'public static int reverseNumber(int n)',
    tests: ['reverseNumber(1234)', 'reverseNumber(1200)', 'reverseNumber(5)', 'reverseNumber(0)'],
    hints: ['Build the answer one digit at a time, starting from 0.', 'Each pass: rev = rev * 10 + n % 10, then n /= 10.'],
    solution: W`public static int reverseNumber(int n) {
    int rev = 0;
    while (n > 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }
    return rev;
}`,
    wrong: [W`public static int reverseNumber(int n) {
    int rev = 0;
    while (n > 0) {
        rev = rev + n % 10;
        n /= 10;
    }
    return rev;
}`],
    explain: 'Multiplying rev by 10 shifts its digits left to make room, then the last digit of n drops into the ones place.' },

  { id: 'collatz', topic: '2.7', title: 'Collatz steps', kind: 'return',
    prompt: 'Start at <code>n</code> (1 or more). If it is even, halve it. If it is odd, make it 3n + 1. Return how many steps it takes to reach 1. <code>collatzSteps(1)</code> is 0 and <code>collatzSteps(6)</code> is 8.',
    sig: 'public static int collatzSteps(int n)',
    tests: ['collatzSteps(1)', 'collatzSteps(2)', 'collatzSteps(3)', 'collatzSteps(6)', 'collatzSteps(27)'],
    hints: ['You do not know how many steps ahead of time, so use a while loop: while (n != 1).', 'Inside, use if / else on n % 2 == 0, and count each step.'],
    solution: W`public static int collatzSteps(int n) {
    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0) {
            n = n / 2;
        } else {
            n = 3 * n + 1;
        }
        steps++;
    }
    return steps;
}`,
    wrong: [W`public static int collatzSteps(int n) {
    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0) {
            n = n / 2;
        }
        n = 3 * n + 1;
        steps++;
        if (steps > 500) {
            return -1;
        }
    }
    return steps;
}`],
    explain: 'A while loop fits because the number of steps is unknown. The if / else makes sure exactly one rule applies each step.' },

  { id: 'sumRange', topic: '2.8', title: 'Sum a range', kind: 'return',
    prompt: 'Return the sum of every int from <code>a</code> to <code>b</code>, including both. You can assume a ≤ b. <code>sumRange(1, 5)</code> is 15.',
    sig: 'public static int sumRange(int a, int b)',
    tests: ['sumRange(1, 5)', 'sumRange(3, 3)', 'sumRange(-2, 2)', 'sumRange(10, 12)'],
    hints: ['Accumulator: start a sum at 0 and add inside a for loop.', 'Loop from a while i <= b so b is included.'],
    solution: W`public static int sumRange(int a, int b) {
    int sum = 0;
    for (int i = a; i <= b; i++) {
        sum += i;
    }
    return sum;
}`,
    wrong: [W`public static int sumRange(int a, int b) {
    int sum = 0;
    for (int i = a; i < b; i++) {
        sum += i;
    }
    return sum;
}`, W`public static int sumRange(int a, int b) {
    int sum = 0;
    for (int i = a; i <= b; i++) {
        sum = i;
    }
    return sum;
}`],
    explain: 'Accumulator pattern: declare the total outside the loop, add to it inside, return it after. <= includes the last number.' },

  { id: 'countdown', topic: '2.8', title: 'Countdown', kind: 'print',
    prompt: 'Print the numbers from <code>n</code> down to 1 on one line, each followed by a space, then print <code>Liftoff!</code> and end the line. <code>countdown(3)</code> prints <code>3 2 1 Liftoff!</code>',
    sig: 'public static void countdown(int n)',
    tests: ['countdown(3)', 'countdown(1)', 'countdown(0)', 'countdown(5)'],
    hints: ['Count down: for (int i = n; i >= 1; i--).', 'Use print inside the loop and println("Liftoff!") after it.'],
    solution: W`public static void countdown(int n) {
    for (int i = n; i >= 1; i--) {
        System.out.print(i + " ");
    }
    System.out.println("Liftoff!");
}`,
    wrong: [W`public static void countdown(int n) {
    for (int i = n; i > 1; i--) {
        System.out.print(i + " ");
    }
    System.out.println("Liftoff!");
}`, W`public static void countdown(int n) {
    for (int i = n; i >= 1; i--) {
        System.out.println(i + " ");
    }
    System.out.println("Liftoff!");
}`],
    explain: 'The loop counts down by changing the update to i--. print keeps everything on one line until the final println.' },

  { id: 'isPrime', topic: '2.9', title: 'Is prime', kind: 'return',
    prompt: 'Return <code>true</code> if <code>n</code> is prime: greater than 1 and divisible only by 1 and itself.',
    sig: 'public static boolean isPrime(int n)',
    tests: ['isPrime(2)', 'isPrime(13)', 'isPrime(29)', 'isPrime(9)', 'isPrime(49)', 'isPrime(1)', 'isPrime(0)'],
    hints: ['Numbers below 2 are never prime. Handle that first.', 'Try every d from 2 up to n - 1. If n % d == 0 for any of them, it is not prime.'],
    solution: W`public static boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int d = 2; d < n; d++) {
        if (n % d == 0) {
            return false;
        }
    }
    return true;
}`,
    wrong: [W`public static boolean isPrime(int n) {
    for (int d = 2; d < n; d++) {
        if (n % d == 0) {
            return false;
        }
    }
    return true;
}`, W`public static boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int d = 2; d <= n; d++) {
        if (n % d == 0) {
            return false;
        }
    }
    return true;
}`, W`public static boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int d = 2; d < n; d++) {
        if (n % d == 0) {
            return false;
        } else {
            return true;
        }
    }
    return true;
}`],
    explain: 'Return false the moment you find a divisor. Only return true after the loop has checked every candidate. Returning true inside the loop (the else) would stop after checking just 2.' },

  { id: 'gcd', topic: '2.9', title: 'Greatest common divisor', kind: 'return',
    prompt: 'Return the largest number that divides both <code>a</code> and <code>b</code> evenly. Both are 1 or more. <code>gcd(12, 18)</code> is 6.',
    sig: 'public static int gcd(int a, int b)',
    tests: ['gcd(12, 18)', 'gcd(7, 3)', 'gcd(10, 5)', 'gcd(9, 9)', 'gcd(1, 100)'],
    hints: ['Try every d from 1 up to the smaller of a and b.', 'Whenever both a % d == 0 and b % d == 0, remember d. The last one you remember is the biggest.'],
    solution: W`public static int gcd(int a, int b) {
    int best = 1;
    for (int d = 1; d <= a && d <= b; d++) {
        if (a % d == 0 && b % d == 0) {
            best = d;
        }
    }
    return best;
}`,
    wrong: [W`public static int gcd(int a, int b) {
    for (int d = 1; d <= a; d++) {
        if (a % d == 0 && b % d == 0) {
            return d;
        }
    }
    return 1;
}`, W`public static int gcd(int a, int b) {
    int best = 1;
    for (int d = 1; d < a && d < b; d++) {
        if (a % d == 0 && b % d == 0) {
            best = d;
        }
    }
    return best;
}`],
    explain: 'Counting up and saving each common divisor leaves the biggest one at the end. Returning early would give you the smallest (always 1).' },

  { id: 'countMultiples', topic: '2.9', title: 'Count multiples', kind: 'return',
    prompt: 'Return how many numbers from 1 to <code>n</code> are divisible by <code>k</code>. <code>countMultiples(20, 3)</code> is 6 (3, 6, 9, 12, 15, 18).',
    sig: 'public static int countMultiples(int n, int k)',
    tests: ['countMultiples(20, 3)', 'countMultiples(10, 10)', 'countMultiples(5, 7)', 'countMultiples(100, 1)'],
    hints: ['Counter pattern: loop 1 to n, add 1 when i % k == 0.'],
    solution: W`public static int countMultiples(int n, int k) {
    int count = 0;
    for (int i = 1; i <= n; i++) {
        if (i % k == 0) {
            count++;
        }
    }
    return count;
}`,
    wrong: [W`public static int countMultiples(int n, int k) {
    int count = 0;
    for (int i = 1; i < n; i++) {
        if (i % k == 0) {
            count++;
        }
    }
    return count;
}`],
    explain: 'A loop over every candidate, an if to test it, and a counter. Using < n would miss n itself (countMultiples(10, 10) needs to count 10).' },

  { id: 'countLetter', topic: '2.10', title: 'Count a letter', kind: 'return',
    prompt: 'Return how many times the one-letter String <code>letter</code> appears in <code>s</code>. <code>countLetter("mississippi", "s")</code> is 4.',
    sig: 'public static int countLetter(String s, String letter)',
    tests: ['countLetter("mississippi", "s")', 'countLetter("hello", "z")', 'countLetter("", "a")', 'countLetter("aaa", "a")', 'countLetter("Banana", "b")'],
    hints: ['Loop i from 0 while i < s.length().', 'Compare s.substring(i, i + 1) to letter with .equals, never ==.'],
    solution: W`public static int countLetter(String s, String letter) {
    int count = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.substring(i, i + 1).equals(letter)) {
            count++;
        }
    }
    return count;
}`,
    wrong: [W`public static int countLetter(String s, String letter) {
    int count = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.substring(i, i + 1) == letter) {
            count++;
        }
    }
    return count;
}`, W`public static int countLetter(String s, String letter) {
    int count = 0;
    for (int i = 1; i < s.length(); i++) {
        if (s.substring(i, i + 1).equals(letter)) {
            count++;
        }
    }
    return count;
}`],
    explain: 'Traverse with substring(i, i + 1), compare with .equals. == compares objects, and substring makes new objects, so == fails even when the letters match. Note "Banana" has no lowercase b.' },

  { id: 'reverse', topic: '2.10', title: 'Reverse a String', kind: 'return',
    prompt: 'Return <code>s</code> backwards. <code>reverse("stop")</code> returns <code>"pots"</code>.',
    sig: 'public static String reverse(String s)',
    tests: ['reverse("stop")', 'reverse("a")', 'reverse("")', 'reverse("racecar")', 'reverse("AP CSA")'],
    hints: ['Start with an empty String "" and build the answer in a loop.', 'Put each letter in front of what you have: rev = letter + rev.'],
    solution: W`public static String reverse(String s) {
    String rev = "";
    for (int i = 0; i < s.length(); i++) {
        rev = s.substring(i, i + 1) + rev;
    }
    return rev;
}`,
    wrong: [W`public static String reverse(String s) {
    String rev = "";
    for (int i = 0; i < s.length(); i++) {
        rev = rev + s.substring(i, i + 1);
    }
    return rev;
}`, W`public static String reverse(String s) {
    String rev = "";
    for (int i = s.length(); i >= 0; i--) {
        rev += s.substring(i, i + 1);
    }
    return rev;
}`],
    explain: 'Adding each letter to the front reverses the order. You can also loop i from s.length() - 1 down to 0 and add to the end. Starting at s.length() crashes.' },

  { id: 'isPalindrome', topic: '2.10', title: 'Palindrome', kind: 'return',
    prompt: 'Return <code>true</code> if <code>s</code> reads the same forwards and backwards. The empty String counts as a palindrome.',
    sig: 'public static boolean isPalindrome(String s)',
    tests: ['isPalindrome("racecar")', 'isPalindrome("abba")', 'isPalindrome("abc")', 'isPalindrome("ab")', 'isPalindrome("")', 'isPalindrome("x")'],
    hints: ['Compare letter i with the letter at the mirror position, s.length() - 1 - i.', 'You only need to check the first half. Return false at the first mismatch.'],
    solution: W`public static boolean isPalindrome(String s) {
    int n = s.length();
    for (int i = 0; i < n / 2; i++) {
        String front = s.substring(i, i + 1);
        String back = s.substring(n - 1 - i, n - i);
        if (!front.equals(back)) {
            return false;
        }
    }
    return true;
}`,
    wrong: [W`public static boolean isPalindrome(String s) {
    int n = s.length();
    for (int i = 0; i < n / 2; i++) {
        String front = s.substring(i, i + 1);
        String back = s.substring(n - 1 - i, n - i);
        if (front.equals(back)) {
            return true;
        }
    }
    return false;
}`],
    explain: 'Check pairs from the outside in and bail out on the first mismatch. Returning true on the first match is a classic mistake: "abca" would pass.' },

  { id: 'removeVowels', topic: '2.10', title: 'Remove vowels', kind: 'return',
    prompt: 'Return <code>s</code> (all lowercase) with every vowel a, e, i, o, u removed. <code>removeVowels("education")</code> returns <code>"dctn"</code>.',
    sig: 'public static String removeVowels(String s)',
    tests: ['removeVowels("education")', 'removeVowels("rhythm")', 'removeVowels("aeiou")', 'removeVowels("banana")'],
    hints: ['Build a new String and only add letters that are not vowels.', 'Trick: "aeiou".indexOf(letter) is -1 when letter is not a vowel.'],
    solution: W`public static String removeVowels(String s) {
    String result = "";
    for (int i = 0; i < s.length(); i++) {
        String ch = s.substring(i, i + 1);
        if ("aeiou".indexOf(ch) == -1) {
            result += ch;
        }
    }
    return result;
}`,
    wrong: [W`public static String removeVowels(String s) {
    String result = "";
    for (int i = 0; i < s.length(); i++) {
        String ch = s.substring(i, i + 1);
        if ("aeiou".indexOf(ch) > 0) {
            result += ch;
        }
    }
    return result;
}`],
    explain: 'Strings cannot be changed, so you build a new one with only the letters you keep. indexOf returning -1 means "not found in the vowel list".' },

  { id: 'countWords', topic: '2.10', title: 'Count words', kind: 'return',
    prompt: 'Words in <code>s</code> are separated by single spaces, with no spaces at the start or end. Return the number of words. The empty String has 0 words.',
    sig: 'public static int countWords(String s)',
    tests: ['countWords("hello world")', 'countWords("one")', 'countWords("")', 'countWords("a b c d")'],
    hints: ['Count the spaces. Words = spaces + 1.', 'Handle the empty String first, or it would say 1.'],
    solution: W`public static int countWords(String s) {
    if (s.length() == 0) {
        return 0;
    }
    int spaces = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.substring(i, i + 1).equals(" ")) {
            spaces++;
        }
    }
    return spaces + 1;
}`,
    wrong: [W`public static int countWords(String s) {
    int spaces = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.substring(i, i + 1).equals(" ")) {
            spaces++;
        }
    }
    return spaces + 1;
}`, W`public static int countWords(String s) {
    int spaces = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.substring(i, i + 1).equals(" ")) {
            spaces++;
        }
    }
    return spaces;
}`],
    explain: 'With single spaces between words, there is always one more word than spaces. The empty String is the one exception, so it gets its own check.' },

  { id: 'printTriangle', topic: '2.11', title: 'Star triangle', kind: 'print',
    prompt: 'Print <code>n</code> rows of stars. Row 1 has 1 star, row 2 has 2, and so on. <code>printTriangle(3)</code> prints:<pre class="ex">*\n**\n***</pre>',
    sig: 'public static void printTriangle(int n)',
    tests: ['printTriangle(3)', 'printTriangle(1)', 'printTriangle(0)', 'printTriangle(5)'],
    hints: ['Outer loop: one pass per row. Inner loop: one pass per star.', 'The inner loop runs row times. End each row with println().'],
    solution: W`public static void printTriangle(int n) {
    for (int row = 1; row <= n; row++) {
        for (int col = 1; col <= row; col++) {
            System.out.print("*");
        }
        System.out.println();
    }
}`,
    wrong: [W`public static void printTriangle(int n) {
    for (int row = 1; row <= n; row++) {
        for (int col = 1; col <= n; col++) {
            System.out.print("*");
        }
        System.out.println();
    }
}`, W`public static void printTriangle(int n) {
    for (int row = 1; row <= n; row++) {
        for (int col = 1; col <= row; col++) {
            System.out.println("*");
        }
    }
}`],
    explain: 'The inner loop bound uses the outer variable (col <= row), which is what makes each row longer than the last.' },

  { id: 'timesTable', topic: '2.11', title: 'Times table', kind: 'print',
    prompt: 'Print an <code>n</code> by <code>n</code> times table. Row i has i×1, i×2, ..., i×n, each followed by a space. <code>timesTable(3)</code> prints:<pre class="ex">1 2 3 \n2 4 6 \n3 6 9 </pre>',
    sig: 'public static void timesTable(int n)',
    tests: ['timesTable(3)', 'timesTable(1)', 'timesTable(4)'],
    hints: ['Outer loop for rows i, inner loop for columns j, both from 1 to n.', 'Print i * j + " " inside, println() after the inner loop.'],
    solution: W`public static void timesTable(int n) {
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            System.out.print(i * j + " ");
        }
        System.out.println();
    }
}`,
    wrong: [W`public static void timesTable(int n) {
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            System.out.print(i + j + " ");
        }
        System.out.println();
    }
}`],
    explain: 'Nested loops cover every (row, column) pair. Each row is finished by the println() that sits after the inner loop but inside the outer one.' },

  { id: 'countPairs', topic: '2.11', title: 'Even-sum pairs', kind: 'return',
    prompt: 'Count the pairs (i, j) with 1 ≤ i &lt; j ≤ n where i + j is even. For n = 4 the pairs are (1, 3) and (2, 4), so <code>countPairs(4)</code> is 2.',
    sig: 'public static int countPairs(int n)',
    tests: ['countPairs(4)', 'countPairs(5)', 'countPairs(1)', 'countPairs(2)', 'countPairs(10)'],
    hints: ['Outer loop i from 1 to n, inner loop j from i + 1 to n, so every pair is counted once with i < j.', 'Add 1 when (i + j) % 2 == 0.'],
    solution: W`public static int countPairs(int n) {
    int count = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = i + 1; j <= n; j++) {
            if ((i + j) % 2 == 0) {
                count++;
            }
        }
    }
    return count;
}`,
    wrong: [W`public static int countPairs(int n) {
    int count = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if ((i + j) % 2 == 0) {
                count++;
            }
        }
    }
    return count;
}`],
    explain: 'Starting j at i + 1 means each pair is counted once and never paired with itself. Starting j at 1 counts (1, 3) and (3, 1) separately, plus pairs like (2, 2).' },
];

if (typeof module !== 'undefined') module.exports = { PROBLEMS };
