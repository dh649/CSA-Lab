import javax.tools.*;
import java.io.*;
import java.lang.reflect.*;
import java.net.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

public class Harness {
    static String esc(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"') b.append("\\\""); else if (c == '\\') b.append("\\\\");
            else if (c == '\n') b.append("\\n"); else if (c == '\r') b.append("\\r"); else if (c == '\t') b.append("\\t");
            else if (c < 32) b.append(String.format("\\u%04x", (int) c)); else b.append(c);
        }
        return b.append('"').toString();
    }
    public static void main(String[] a) throws Exception {
        JavaCompiler jc = ToolProvider.getSystemJavaCompiler();
        PrintStream realOut = System.out;
        File[] files = new File(a[0]).listFiles((d, n) -> n.endsWith(".java"));
        Arrays.sort(files);
        PrintStream res = new PrintStream(new FileOutputStream(a[1]), true, "UTF-8");
        ExecutorService ex = Executors.newCachedThreadPool(r -> { Thread t = new Thread(r); t.setDaemon(true); return t; });
        for (File f : files) {
            String name = f.getName().replace(".java", "");
            Path outDir = Files.createTempDirectory("h");
            DiagnosticCollector<JavaFileObject> dc = new DiagnosticCollector<>();
            StandardJavaFileManager fm = jc.getStandardFileManager(dc, null, null);
            boolean ok = jc.getTask(null, fm, dc, List.of("-d", outDir.toString(), "-nowarn"), null, fm.getJavaFileObjects(f)).call();
            if (!ok) {
                String msg = dc.getDiagnostics().isEmpty() ? "?" : dc.getDiagnostics().get(0).getMessage(null) + " @line " + dc.getDiagnostics().get(0).getLineNumber();
                res.println("{\"id\":" + esc(name) + ",\"status\":\"compile\",\"out\":\"\",\"err\":" + esc(msg) + "}");
                continue;
            }
            URLClassLoader cl = new URLClassLoader(new URL[]{outDir.toUri().toURL()});
            Class<?> c = cl.loadClass(name);
            Method m = c.getMethod("main", String[].class);
            ByteArrayOutputStream buf = new ByteArrayOutputStream() {
                public synchronized void write(byte[] b, int off, int len) { if (count > 200000) throw new RuntimeException("OUTPUT_LIMIT"); super.write(b, off, len); }
                public synchronized void write(int b) { if (count > 200000) throw new RuntimeException("OUTPUT_LIMIT"); super.write(b); }
            };
            PrintStream ps = new PrintStream(buf, true, "UTF-8");
            System.setOut(ps);
            String status = "ok", err = "";
            Future<?> fut = ex.submit(() -> { m.invoke(null, (Object) new String[0]); return null; });
            try { fut.get(3, TimeUnit.SECONDS); }
            catch (TimeoutException te) { status = "timeout"; fut.cancel(true); }
            catch (ExecutionException ee) {
                Throwable t = ee.getCause();
                if (t instanceof InvocationTargetException) t = t.getCause();
                status = "exception"; err = t.getClass().getSimpleName() + ": " + t.getMessage();
                if (String.valueOf(t.getMessage()).contains("OUTPUT_LIMIT") || (t.getCause() != null && String.valueOf(t.getCause().getMessage()).contains("OUTPUT_LIMIT"))) status = "timeout";
            }
            ps.flush(); System.setOut(realOut);
            res.println("{\"id\":" + esc(name) + ",\"status\":\"" + status + "\",\"out\":" + esc(buf.toString("UTF-8")) + ",\"err\":" + esc(err) + "}");
        }
        res.close();
        System.exit(0);
    }
}
