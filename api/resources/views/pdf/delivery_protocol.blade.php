<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Protocolo de Entrega - Pedido Nº {{ $order->id }}</title>
    <style>
        {!! file_get_contents(public_path('css/delivery.css')) !!}
    </style>    
</head>
<body>
    <div class="container">
        <div class="header">
            <table style="width: 100%; border: none;">
                <tr>
                    <td style="width: 25%; border: none;">
                        @if($settings && $settings->logo_path)
                            <img src="{{ public_path('storage/' . $settings->logo_path) }}" alt="Logo" style="max-width: 150px; max-height: 70px;">
                        @endif
                    </td>
                    <td style="width: 75%; text-align: right; border: none;">
                        <h2 style="margin: 0;">{{ $settings->company_fantasy_name ?? 'Nome da Empresa' }}</h2>
                        <p style="margin: 0; font-size: 10px;">{{ $settings->legal_name ?? '' }}</p>
                        <p style="margin: 0; font-size: 10px;">CNPJ: {{ $settings->cnpj ?? '' }}</p>
                        <p style="margin: 0; font-size: 10px;">Tel: {{ $settings->phone ?? '' }} | Email: {{ $settings->email ?? '' }}</p>
                        <p style="margin: 0; font-size: 10px;">
                            {{
                                implode(', ', array_filter([
                                    $settings->street,
                                    $settings->number ? 'nº ' . $settings->number : null,
                                    $settings->complement,
                                    $settings->neighborhood,
                                    $settings->city ? $settings->city . ' - ' . $settings->state : null,
                                    $settings->cep
                                ]))
                            }}
                        </p>
                    </td>
                </tr>
            </table>
            <hr>

            <h1>Protocolo de Entrega (Via Cliente)</h1>
            <p><strong>Pedido Nº:</strong> {{ $order->id }} | <strong>Orçamento Nº:</strong> {{ $order->quote_id }} | <strong>Recebido em:</strong> {{ now()->format('d/m/Y') }}</p>

            <table class="details-table">
                <tr>
                    <th style="width: 15%;">Cliente:</th>
                    <td>{{ $order->customer->name ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th style="width: 15%;">Consultor:</th>
                    <td>{{ $order->user->name ?? 'N/A' }}</td>
                </tr>
            </table>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Produto/Serviço</th>
                        <th>Qtd.</th>
                        <th class="amount">Valor Unit.</th>
                        <th class="amount">Valor Total</th>
                    </tr>
                </thead>
                <tbody>
                    @if($order->quote)
                    @foreach($order->quote->items as $item)
                    <tr>
                        <td>{{ $item->product->name }}<br>{{ $item->notes ?? '' }}</td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td class="amount">R$ {{ number_format($item->unit_sale_price, 2, ',', '.') }}</td>
                        <td class="amount">R$ {{ number_format($item->total_price, 2, ',', '.') }}</td>
                    </tr>
                    @endforeach
                    @endif
                </tbody>
            </table>
            <table class="total-section">
                <tr>
                    <td class="label">Valor Total do Pedido:</td>
                    <td class="value" style="font-weight: bold;">R$ {{ number_format($order->quote->total_amount, 2, ',', '.') }}</td>
                </tr>
            </table>
            <table class="signatures">
                <tr>
                    <td>_________________________</td>
                    <td>_________________________</td>
                </tr>
                <tr>
                    <td>Representante da Empresa</td>
                    <td>Cliente</td>
                </tr>
            </table>
        </div>

        <hr class="cut-line">

        <div class="header">
            <h1>Protocolo de Entrega (Via Empresa)</h1>
            <p><strong>Pedido Nº:</strong> {{ $order->id }} | <strong>Orçamento Nº:</strong> {{ $order->quote_id }} | <strong>Entregue em:</strong> {{ now()->format('d/m/Y') }}</p>

            <table class="details-table">
                <tr>
                    <th style="width: 15%;">Cliente:</th>
                    <td>{{ $order->customer->name ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th style="width: 15%;">Consultor:</th>
                    <td>{{ $order->user->name ?? 'N/A' }}</td>
                </tr>
            </table>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Produto/Serviço</th>
                        <th>Qtd.</th>
                        <th class="amount">Valor Unit.</th>
                        <th class="amount">Valor Total</th>
                    </tr>
                </thead>
                <tbody>
                    @if($order->quote)
                    @foreach($order->quote->items as $item)
                    <tr>
                        <td>{{ $item->product->name }}<br>{{ $item->notes ?? '' }}</td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td class="amount">R$ {{ number_format($item->unit_sale_price, 2, ',', '.') }}</td>
                        <td class="amount">R$ {{ number_format($item->total_price, 2, ',', '.') }}</td>
                    </tr>
                    @endforeach
                    @endif
                </tbody>
            </table>
            <table class="total-section">
                <tr>
                    <td class="label">Valor Total do Pedido:</td>
                    <td class="value" style="font-weight: bold;">R$ {{ number_format($order->quote->total_amount, 2, ',', '.') }}</td>
                </tr>
            </table>
            <table class="signatures">
                <tr>
                    <td>_________________________</td>
                    <td>_________________________</td>
                </tr>
                <tr>
                    <td>Representante da Empresa</td>
                    <td>Cliente</td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>