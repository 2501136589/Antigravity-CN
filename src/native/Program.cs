using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;

namespace AntigravityCN
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.Title = "Antigravity-CN 汉化工具箱";

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string nodePath = FindNodeOrAntigravity();

            if (string.IsNullOrEmpty(nodePath))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("❌ 错误：未检测到 Node.js 且未找到 Antigravity 客户端！");
                Console.WriteLine("请确保目标电脑已安装 Antigravity (https://antigravity.google)。");
                Console.ResetColor();
                Console.WriteLine("\n按任意键退出...");
                Console.ReadKey();
                return;
            }

            string scriptPath = Path.Combine(appDir, "bin", "antigravity-cn.js");
            if (!File.Exists(scriptPath))
            {
                string fallback = Path.Combine(appDir, "antigravity-cn.js");
                if (File.Exists(fallback)) scriptPath = fallback;
            }

            if (args.Length > 0)
            {
                string cmd = args[0].ToLower().Trim();
                HandleCommand(nodePath, scriptPath, cmd, string.Join(" ", args));
                return;
            }

            ShowInteractiveMenu(nodePath, scriptPath);
        }

        static void KillAntigravityProcesses()
        {
            try
            {
                Process[] procs = Process.GetProcessesByName("Antigravity");
                if (procs.Length > 0)
                {
                    Console.WriteLine("⏳ 检测到 Antigravity 后台残留进程，正在安全退出以释放文件锁定...");
                    foreach (var p in procs)
                    {
                        try
                        {
                            p.Kill();
                            p.WaitForExit(1500);
                        }
                        catch { }
                    }
                    Thread.Sleep(800);
                }

                // 清理可能的单例死锁标记
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string agyData = Path.Combine(appData, "Antigravity");
                if (Directory.Exists(agyData))
                {
                    string[] lockFiles = new string[] { "SingletonLock", "SingletonCookie", "SingletonSocket" };
                    foreach (var lf in lockFiles)
                    {
                        string p = Path.Combine(agyData, lf);
                        if (File.Exists(p))
                        {
                            try { File.Delete(p); } catch { }
                        }
                    }
                }
            }
            catch { }
        }

        static void ApplyStagedAsar()
        {
            string tempAsar = Path.Combine(Path.GetTempPath(), "antigravity-app.asar.patched");
            if (File.Exists(tempAsar))
            {
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string targetAsar = Path.Combine(localAppData, "Programs", "antigravity", "resources", "app.asar");

                if (!File.Exists(targetAsar))
                {
                    string progFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
                    targetAsar = Path.Combine(progFiles, "Antigravity", "resources", "app.asar");
                }

                if (File.Exists(targetAsar))
                {
                    // 确保进程已完全退出
                    KillAntigravityProcesses();

                    int maxRetries = 5;
                    bool success = false;
                    for (int i = 0; i < maxRetries; i++)
                    {
                        try
                        {
                            string origBak = targetAsar + ".bak";
                            if (!File.Exists(origBak))
                            {
                                File.Copy(targetAsar, origBak, true);
                            }

                            string prevBak = targetAsar + ".prev.bak";
                            File.Copy(targetAsar, prevBak, true);

                            File.Copy(tempAsar, targetAsar, true);
                            File.Delete(tempAsar);
                            success = true;
                            break;
                        }
                        catch
                        {
                            Thread.Sleep(500);
                        }
                    }

                    if (success)
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("\n🎉 [Antigravity-CN] 永久汉化补丁安装成功！");
                        Console.WriteLine("✨ 现已支持直接打开官方 Antigravity 客户端，无需后台、无需端口，永久中文！");
                        Console.ResetColor();
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("\n❌ 写入补丁失败：文件仍被系统占用，请在任务管理器中结束 Antigravity 后重试。");
                        Console.ResetColor();
                    }
                }
            }
        }

        static void HandleCommand(string nodeExe, string scriptPath, string cmd, string fullArgs)
        {
            if (cmd == "install" || cmd == "uninstall" || cmd == "patch")
            {
                KillAntigravityProcesses();
            }

            RunCommand(nodeExe, scriptPath, fullArgs);

            if (cmd == "install" || cmd == "patch")
            {
                ApplyStagedAsar();
            }
        }

        static string FindNodeOrAntigravity()
        {
            try
            {
                Process p = new Process();
                p.StartInfo.FileName = "where";
                p.StartInfo.Arguments = "node";
                p.StartInfo.UseShellExecute = false;
                p.StartInfo.RedirectStandardOutput = true;
                p.StartInfo.CreateNoWindow = true;
                p.Start();
                string output = p.StandardOutput.ReadToEnd().Trim();
                p.WaitForExit();
                if (!string.IsNullOrEmpty(output))
                {
                    string firstLine = output.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)[0].Trim();
                    if (File.Exists(firstLine)) return firstLine;
                }
            }
            catch { }

            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string agyExe = Path.Combine(localAppData, "Programs", "antigravity", "Antigravity.exe");
            if (File.Exists(agyExe)) return agyExe;

            string progFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string agyProg = Path.Combine(progFiles, "Antigravity", "Antigravity.exe");
            if (File.Exists(agyProg)) return agyProg;

            return null;
        }

        static void RunCommand(string nodeExe, string scriptPath, string arguments)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = nodeExe;
                psi.Arguments = string.Format("\"{0}\" {1}", scriptPath, arguments);
                psi.UseShellExecute = false;

                if (nodeExe.EndsWith("Antigravity.exe", StringComparison.OrdinalIgnoreCase))
                {
                    psi.EnvironmentVariables["ELECTRON_RUN_AS_NODE"] = "1";
                }

                Process proc = Process.Start(psi);
                proc.WaitForExit();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine(string.Format("执行失败: {0}", ex.Message));
                Console.ResetColor();
            }
        }

        static void ShowInteractiveMenu(string nodeExe, string scriptPath)
        {
            while (true)
            {
                Console.Clear();
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine("===============================================================");
                Console.WriteLine("  🚀 Antigravity-CN: 界面中文汉化与本地化管理工具箱");
                Console.WriteLine("===============================================================");
                Console.ResetColor();
                Console.WriteLine();

                RunCommand(nodeExe, scriptPath, "status");

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("---------------------------------------------------------------");
                Console.WriteLine("  [1] 一键安装 / 更新汉化补丁 (永久生效，0 后台，0 端口)");
                Console.WriteLine("  [2] 实时免重启热注入 (仅对当前打开的窗口生效)");
                Console.WriteLine("  [3] 一键还原官方原版 (从自动备份中恢复)");
                Console.WriteLine("  [4] 运行完整性测试");
                Console.WriteLine("  [0] 退出");
                Console.WriteLine("---------------------------------------------------------------");
                Console.ResetColor();
                Console.Write("\n请输入选项编号 [0-4]: ");

                string key = Console.ReadLine();
                if (key != null) key = key.Trim();
                if (key == "0") break;

                Console.WriteLine();
                if (key == "1")
                {
                    HandleCommand(nodeExe, scriptPath, "install", "install");
                }
                else if (key == "2")
                {
                    HandleCommand(nodeExe, scriptPath, "inject", "inject");
                }
                else if (key == "3")
                {
                    HandleCommand(nodeExe, scriptPath, "uninstall", "uninstall");
                }
                else if (key == "4")
                {
                    string testScript = Path.Combine(Path.GetDirectoryName(Path.GetDirectoryName(scriptPath)), "test", "test-dict.js");
                    RunCommand(nodeExe, testScript, "");
                }

                Console.WriteLine("\n按回车键返回主菜单...");
                Console.ReadLine();
            }
        }
    }
}
