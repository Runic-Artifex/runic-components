using ReactiveUI;
using ReactiveUI.Primitives;
using ReactiveUI.Primitives.Concurrency;
using Runic.Application.Views;
using Runic.Application.Views.ReactiveUI;
using Runic.Desktop;
namespace RunicComponents.Desktop;
public sealed class ShellViewModel : ReactiveObject, IDisposable
{
    private readonly IRunicModelContextLease _lease;
    private Func<DesktopWindow>? _window;
    private bool _maximized, _supportsMinimize, _supportsMaximize, _canMove;
    public ShellViewModel(IRunicModelContext context, ISequencer scheduler)
    {
        _lease = RunicModelContextRegistry.Shared.Bind(context, this);
        MinimizeCommand = ReactiveCommand.CreateFromTask(async () => await Window.MinimizeAsync(), scheduler);
        ToggleMaximizedCommand = ReactiveCommand.CreateFromTask(async () =>
        {
            await Window.ToggleMaximizedAsync();
            Maximized = !Maximized;
        }, scheduler);
        RequestCloseCommand = ReactiveCommand.CreateFromTask(async () => { await Window.RequestCloseAsync(); }, scheduler);
    }
    private DesktopWindow Window => _window?.Invoke() ?? throw new InvalidOperationException("Window not attached.");
    public bool Maximized { get => _maximized; private set => this.RaiseAndSetIfChanged(ref _maximized, value); }
    public bool SupportsMinimize { get => _supportsMinimize; private set => this.RaiseAndSetIfChanged(ref _supportsMinimize, value); }
    public bool SupportsMaximize { get => _supportsMaximize; private set => this.RaiseAndSetIfChanged(ref _supportsMaximize, value); }
    public bool CanMove { get => _canMove; private set => this.RaiseAndSetIfChanged(ref _canMove, value); }
    public ReactiveCommand<RxVoid, RxVoid> MinimizeCommand { get; }
    public ReactiveCommand<RxVoid, RxVoid> ToggleMaximizedCommand { get; }
    public ReactiveCommand<RxVoid, RxVoid> RequestCloseCommand { get; }
    internal void Attach(Func<DesktopWindow> window) => _window = window;
    internal void RefreshCapabilities(bool supportsNativeDrag)
    {
        SupportsMinimize = Window.Capabilities.HasFlag(DesktopWindowCapabilities.Minimize);
        SupportsMaximize = Window.Capabilities.HasFlag(DesktopWindowCapabilities.Maximize);
        CanMove = supportsNativeDrag && Window.Capabilities.HasFlag(DesktopWindowCapabilities.Move);
    }
    public void Dispose()
    {
        MinimizeCommand.Dispose(); ToggleMaximizedCommand.Dispose(); RequestCloseCommand.Dispose(); _lease.Dispose();
    }
}
