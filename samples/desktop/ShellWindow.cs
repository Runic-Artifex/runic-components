using Runic.Application.Views;
using Runic.Application.Views.Desktop;
using Runic.Application.Views.ReactiveUI;
namespace RunicComponents.Desktop;
public sealed partial class ShellWindow : ReactiveRunicWindow<ShellViewModel>, IBridgeWindow
{
    private readonly DesktopBridgeWindow<ShellViewModel> _host;
    public Runic.Desktop.DesktopWindow Presentation => _host.Presentation;
    public ShellWindow(DesktopBridgeWindow<ShellViewModel> host) : base(host.ViewModel)
    {
        _host = host;
        host.ViewModel.Attach(() => host.Presentation);
    }
    public ValueTask<BridgeWindowCloseResult> CloseAsync(TimeSpan timeout) => _host.CloseAsync(timeout);
    public ValueTask DisposeAsync() => _host.DisposeAsync();
}
