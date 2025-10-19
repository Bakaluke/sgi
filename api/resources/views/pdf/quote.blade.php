<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamento Nº {{ $quote->id }}</title>
    <style>
        {!! file_get_contents(public_path('css/quote.css')) !!}
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
            <h2>Orçamento Nº {{ $quote->id }}</h2>
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
            <p><strong>Forma de Pagamento:</strong> {{ $quote->paymentMethod?->name ?? 'N/A' }}</p>
            <p><strong>Forma de Entrega:</strong> {{ $quote->deliveryMethod?->name ?? 'N/A' }}</p>
        </div>

        <div class="quote-table">
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;"></th>
                        <th>Produto</th>
                        <th>Qtd.</th>
                        <th>Preço Unit.</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($quote->items as $item)
                    <tr>
                        <td>
                            @if($item->product && $item->product->image_path)
                            <img src="{{ public_path('storage/' . $item->product->image_path) }}" style="width: 50px; height: 50px; object-fit: cover;">
                            @endif
                        </td>
                        <td>{{ $item->product_name }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>R$ {{ number_format($item->unit_sale_price, 2, ',', '.') }}</td>
                        <td>R$ {{ number_format($item->total_price, 2, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        

        <div class="footer-block">
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
        </div>

        <div class="signatures">
            <table style="width: 100%; border: none; text-align: center;">
                <tbody>
                    <tr>
                        <td style="width: 50%; border: none; padding: 10px; text-align: center;">
                            <hr style="width: 80%; margin: 0 auto; border-top: 1px solid #333;">
                            <p style="font-size: 10px; color: #555;">Representante da Empresa</p>
                        </td>
                        <td style="width: 50%; border: none; padding: 10px; text-align: center;">
                            <hr style="width: 80%; margin: 0 auto; border-top: 1px solid #333;">
                            <p style="font-size: 10px; color: #555;">Cliente</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</body>
</html>