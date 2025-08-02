<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Orçamento Nº {{ $quote->id }}</title>
    <style>
        {!! file_get_contents(public_path('css/quote.css')) !!}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Orçamento Nº {{ $quote->id }}</h1>
            <p>Data de Emissão: {{ $quote->created_at->format('d/m/Y') }}</p>
        </div>

        <div class="customer-info">
            <h3>Dados do Cliente</h3>
            <p><strong>Nome:</strong> {{ $customer_data['name'] ?? 'N/A' }}</p>
            <p><strong>E-mail:</strong> {{ $customer_data['email'] ?? 'N/A' }}</p>
            <p><strong>Telefone:</strong> {{ $customer_data['phone'] ?? 'N/A' }}</p>
            <p><strong>Endereço:</strong> {{ $customer_data['address'] ?? 'N/A' }}</p>
        </div>

        <div class="quote-info">
            <h3>Detalhes do Orçamento</h3>
            <p><strong>Consultor:</strong> {{ $quote->salesperson_name }}</p>
            <p><strong>Forma de Pagamento:</strong> {{ $quote->payment_method ?? 'N/A' }}</p>
            <p><strong>Opção de Entrega:</strong> {{ $quote->delivery_method ?? 'N/A' }}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Qtd.</th>
                    <th>Preço Unit.</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quote->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>R$ {{ number_format($item->unit_sale_price, 2, ',', '.') }}</td>
                    <td>R$ {{ number_format($item->total_price, 2, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <th>Subtotal:</th>
                    <td>R$ {{ number_format($quote->subtotal, 2, ',', '.') }}</td>
                </tr>
                <tr>
                    <th>Desconto:</th>
                    <td>{{ $quote->discount_percentage }}%</td>
                </tr>
                <tr>
                    <th>Total:</th>
                    <td><strong>R$ {{ number_format($quote->total_amount, 2, ',', '.') }}</strong></td>
                </tr>
            </table>
        </div>

        @if($quote->notes)
        <div class="notes">
            <h4>Observações:</h4>
            <p>{{ $quote->notes }}</p>
        </div>
        @endif

        <div class="signatures">
            <table style="width: 100%; border: none; text-align: center;">
                <tbody>
                    <tr>
                        <td style="width: 50%; border: none; padding: 10px; text-align: center;">
                            <hr style="width: 80%; margin: 0 auto; border-top: 1px solid #333;">
                            <p style="margin-top: 5px;">{{ $quote->salesperson_name }}</p>
                            <p style="font-size: 10px; color: #555;">Representante da Empresa</p>
                        </td>
                        <td style="width: 50%; border: none; padding: 10px; text-align: center;">
                            <hr style="width: 80%; margin: 0 auto; border-top: 1px solid #333;">
                            <p style="margin-top: 5px;">{{ $customer_data['name'] ?? 'Cliente' }}</p>
                            <p style="font-size: 10px; color: #555;">Cliente</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</body>
</html>