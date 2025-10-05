<!DOCTYPE html>
<html>
<head>
    <title>Seu Orçamento</title>
</head>
<body>
    {{-- A variável $emailBody virá do nosso controller --}}
    {!! nl2br(e($emailBody)) !!} 
</body>
</html>