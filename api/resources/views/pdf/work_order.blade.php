<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ordem de Produção Nº {{ $order->internal_id }}</title>
    <style>
        {!! file_get_contents(public_path('css/work_order.css')) !!}
    </style>    
</head>
<body>
    <div class="container">
        <div class="header">
            <table style="width: 100%; border: none;">
                <tr>
                    <td style="width: 25%; border: none;">
                        @if($settings && $settings->logo_path)
                            @php
                                $logoPath = storage_path('app/public/' . $settings->logo_path);
                                $logoSrc = '';
                                if (file_exists($logoPath)) {
                                    $logoData = base64_encode(file_get_contents($logoPath));
                                    $logoSrc = 'data:' . mime_content_type($logoPath) . ';base64,' . $logoData;
                                }
                            @endphp
                            <img src="{{ $logoSrc }}" alt="Logo" style="max-width: 150px; max-height: 70px;">
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
            <h2>Ordem de Produção Nº {{ $order->internal_id }}</h2>
            <p>Data de Emissão: {{ $order->created_at ? $order->created_at->format('d/m/Y') : 'Não definida' }}</p>
        </div>

        <div class="quote-info">
            <p><strong>Cliente:</strong> {{ $order->customer->name ?? 'N/A' }}</p>
            <p><strong>Consultor:</strong> {{ $order->user->name ?? 'N/A' }}</p>
            <p><strong>Observações Gerais:</strong> Orçamento Nº {{ $order->quote->internal_id ?? $order->quote_id }}<br>{{ $order->notes }}</p>
        </div>

        <h3 style="margin-top: 30px;">Itens do Pedido:</h3>
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 80%;">Produto</th>
                    <th style="width: 20%; text-align: center;">Quantidade</th>
                </tr>
            </thead>
            <tbody>
                @if($order->quote && $order->quote->items->isNotEmpty())
                    @foreach($order->quote->items as $item)
                        <tr style="background-color: #f9f9f9;">
                            <td><span style="font-weight: bold;">{{ $item->product->name }}</span><br>@if($item->notes){{ $item->notes }}@endif</td>
                            <td style="text-align: center; font-weight: bold;">{{ $item->quantity }}</td>
                        </tr>

                        @if($item->notes || $item->file_path)
                        <tr>
                            <td colspan="2" style="padding-left: 20px;">
                                @if($item->file_path)
                                    <p class="notes" style="margin: 10px 0 5px 0;"><strong>Referência:</strong></p>
                                    <div style="text-align: center;">
                                        @php
                                            $imagePath = storage_path('app/public/' . $item->file_path);
                                            $imageSrc = '';
                                            $isImage = false;
                                            if (file_exists($imagePath)) {
                                                $extension = strtolower(pathinfo($imagePath, PATHINFO_EXTENSION));
                                                if(in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
                                                    $isImage = true;
                                                    $imageData = base64_encode(file_get_contents($imagePath));
                                                    $imageSrc = 'data:' . mime_content_type($imagePath) . ';base64,' . $imageData;
                                                }
                                            }
                                        @endphp

                                        @if($isImage)
                                            <img src="{{ $imageSrc }}" alt="Referência" class="attachment-image">
                                        @else
                                            <span>Arquivo anexado (não é uma imagem ou não foi encontrado)</span>
                                        @endif
                                    </div>
                                @endif
                            </td>
                        </tr>
                        @endif
                    @endforeach
                @else
                    <tr>
                        <td colspan="2" style="text-align: center; padding: 20px;">
                            (Orçamento não encontrado ou sem itens)
                        </td>
                    </tr>
                @endif
            </tbody>
        </table>
    </div>
</body>
</html>