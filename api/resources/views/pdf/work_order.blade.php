<!DOCTYPE html><html><head><title>Ordem de Produção Nº {{ $order->id }}</title><style>/* ... CSS ... */</style></head><body>
    <h1>Ordem de Produção Nº {{ $order->id }}</h1>
    <p><strong>Cliente:</strong> {{ $order->customer->name }}</p>
    <p><strong>Data do Pedido:</strong> {{ $order->created_at->format('d/m/Y') }}</p>
    <hr>
    <h3>Itens a Produzir/Separar:</h3>
    <table>
        <thead><tr><th>Produto (SKU)</th><th>Quantidade</th></tr></thead>
        <tbody>
            @foreach($order->quote->items as $item)
            <tr>
                <td>{{ $item->product->name }} ({{ $item->product->sku }})</td>
                <td>{{ $item->quantity }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body></html>