using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Diagnostics;

namespace RecreioDoMorro
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string distDir = Path.Combine(appDir, "cafe-gestao", "dist");
            if (!Directory.Exists(distDir))
            {
                distDir = Path.Combine(appDir, "dist");
            }

            int port = 14876;
            TcpListener listener = null;

            if (Directory.Exists(distDir))
            {
                try
                {
                    listener = new TcpListener(IPAddress.Loopback, port);
                    listener.Start();

                    Thread serverThread = new Thread(() =>
                    {
                        while (true)
                        {
                            try
                            {
                                TcpClient client = listener.AcceptTcpClient();
                                ThreadPool.QueueUserWorkItem((c) => HandleClient((TcpClient)c, distDir), client);
                            }
                            catch { break; }
                        }
                    });
                    serverThread.IsBackground = true;
                    serverThread.Start();
                }
                catch { listener = null; }
            }

            string targetUrl = (listener != null) ? "http://127.0.0.1:" + port + "/" : "https://recreiodomorro-f7e1a.web.app/";

            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(edgePath))
                edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

            string chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
            if (!File.Exists(chromePath))
                chromePath = @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe";

            if (File.Exists(edgePath))
            {
                Process.Start(new ProcessStartInfo(edgePath, "--app=" + targetUrl + " --window-size=1280,820") { UseShellExecute = true });
            }
            else if (File.Exists(chromePath))
            {
                Process.Start(new ProcessStartInfo(chromePath, "--app=" + targetUrl + " --window-size=1280,820") { UseShellExecute = true });
            }
            else
            {
                Process.Start(new ProcessStartInfo(targetUrl) { UseShellExecute = true });
            }

            if (listener != null)
            {
                while (true)
                {
                    Thread.Sleep(30000);
                }
            }
        }

        static void HandleClient(TcpClient client, string distDir)
        {
            using (client)
            using (NetworkStream stream = client.GetStream())
            {
                try
                {
                    byte[] buffer = new byte[4096];
                    int bytesRead = stream.Read(buffer, 0, buffer.Length);
                    if (bytesRead <= 0) return;

                    string request = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    string[] lines = request.Split(new string[] { "\r\n" }, StringSplitOptions.None);
                    if (lines.Length == 0) return;

                    string[] tokens = lines[0].Split(' ');
                    if (tokens.Length < 2) return;

                    string path = tokens[1].Split('?')[0].TrimStart('/');
                    if (string.IsNullOrEmpty(path)) path = "index.html";

                    string filePath = Path.Combine(distDir, path.Replace('/', Path.DirectorySeparatorChar));
                    if (!File.Exists(filePath))
                    {
                        filePath = Path.Combine(distDir, "index.html");
                    }

                    if (File.Exists(filePath))
                    {
                        byte[] fileBytes = File.ReadAllBytes(filePath);
                        string ext = Path.GetExtension(filePath).ToLowerInvariant();
                        string mime = "application/octet-stream";
                        if (ext == ".html") mime = "text/html; charset=utf-8";
                        else if (ext == ".js") mime = "application/javascript; charset=utf-8";
                        else if (ext == ".css") mime = "text/css; charset=utf-8";
                        else if (ext == ".png") mime = "image/png";
                        else if (ext == ".ico") mime = "image/x-icon";
                        else if (ext == ".svg") mime = "image/svg+xml";
                        else if (ext == ".json") mime = "application/json";

                        string header = "HTTP/1.1 200 OK\r\n" +
                                        "Content-Type: " + mime + "\r\n" +
                                        "Content-Length: " + fileBytes.Length + "\r\n" +
                                        "Connection: close\r\n\r\n";
                        byte[] headerBytes = Encoding.UTF8.GetBytes(header);
                        stream.Write(headerBytes, 0, headerBytes.Length);
                        stream.Write(fileBytes, 0, fileBytes.Length);
                    }
                    else
                    {
                        string notFound = "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n";
                        byte[] nfBytes = Encoding.UTF8.GetBytes(notFound);
                        stream.Write(nfBytes, 0, nfBytes.Length);
                    }
                }
                catch { }
            }
        }
    }
}
