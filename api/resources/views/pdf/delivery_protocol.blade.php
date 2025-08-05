<!DOCTYPE html><html><head><title>Protocolo de Entrega - Pedido Nº {{ $order->id }}</title><style>/* ... CSS ... */ .via { border: 1px dashed #ccc; padding: 15px; margin-bottom: 30px; } </style></head><body>
    <div class="via">
        <h2>Protocolo de Entrega - Pedido Nº {{ $order->id }} (Via da Empresa)</h2>
        <p><strong>Cliente:</strong> {{ $order->customer->name }}</p>
        <p><strong>Data:</strong> ____/____/______</p>
        <br><br>
        <hr style="width: 50%;"><p style="text-align: center;">Assinatura do Cliente</p>
    </div>
    <div class="via">
        <h2>Protocolo de Entrega - Pedido Nº {{ $order->id }} (Via do Cliente)</h2>
        <p><strong>Cliente:</strong> {{ $order->customer->name }}</p>
        <p><strong>Recebido por:</strong> _________________________</p>
        <br><br>
        <hr style="width: 50%;"><p style="text-align: center;">Assinatura do Responsável</p>
    </div>
</body></html>