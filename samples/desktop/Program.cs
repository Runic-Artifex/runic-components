using Microsoft.Extensions.DependencyInjection;
using Runic.Application.Views;
using Runic.Application.Views.Desktop;
using Runic.Application.Views.ReactiveUI;
using Runic.Desktop;
using Runic.Desktop.Gtk4;
using RunicComponents.Desktop;

var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../.."));
var useGtk3 = args.Contains("--gtk3", StringComparer.Ordinal);
var options = useGtk3
    ? new DesktopHostOptions { Linux = new() { EmbeddedBackend = LinuxEmbeddedBackend.Gtk3WebKit41 } }
    : new DesktopHostOptions().WithGtk4();
return DesktopEventLoop.Run(options, async desktop =>
{
    var services = new ServiceCollection();
    services.AddRunicReactiveModelContext();
    services.AddScoped<ShellViewModel>();
    services.AddRunicBridges();
    await using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateScopes = true });
    var windowOptions = new DesktopWindowOptions
    {
        Browser = BrowserKind.Embedded, Frameless = true,
        Width = 1100, Height = 760, MinimumWidth = 640, MinimumHeight = 480,
        // Put application save/confirmation policy here; user close requests must use RequestCloseAsync.
        ConfirmCloseAsync = _ => ValueTask.FromResult(true),
    };
    desktop.Validate(windowOptions).ThrowIfInvalid();
    ShellViewModel? model = null;
    await using var window = await provider.OpenDesktopWindowAsync<ShellWindow, ShellViewModel>(
        desktop,
        new DesktopSurfaceOptions { Content = new DesktopContent.Directory(Path.Combine(root, "dist"), "native.html") },
        host => { model = host.ViewModel; return new ShellWindow(host); }, windowOptions);
    model!.RefreshCapabilities(!OperatingSystem.IsLinux() || useGtk3);
    Console.WriteLine("RUNIC_COMPONENTS_NATIVE_OPEN");
    // Keep the event-loop callback alive until the presentation closes.
    while (window.Presentation.IsOpen) await Task.Delay(100);
    return 0;
});
