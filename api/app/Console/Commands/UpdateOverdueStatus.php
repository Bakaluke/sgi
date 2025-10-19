<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AccountReceivable;
use App\Models\AccountPayable;
use Carbon\Carbon;

class UpdateOverdueStatus extends Command
{
    protected $signature = 'app:update-overdue-status';

    protected $description = 'Atualiza o status de contas a pagar e receber para "vencido" se a data de vencimento já passou.';

    public function handle()
    {
        $this->info('Iniciando a verificação de contas vencidas...');

        $today = Carbon::now()->startOfDay();

        $receivablesUpdated = AccountReceivable::whereIn('status', ['pending', 'partially_paid'])
            ->where('due_date', '<', $today)
            ->update(['status' => 'overdue']);

        $this->info($receivablesUpdated . ' conta(s) a receber foram atualizadas para "vencido".');

        $payablesUpdated = AccountPayable::whereIn('status', ['pending', 'partially_paid'])
            ->where('due_date', '<', $today)
            ->update(['status' => 'overdue']);
            
        $this->info($payablesUpdated . ' conta(s) a pagar foram atualizadas para "vencido".');

        $this->info('Verificação concluída com sucesso!');

        return Command::SUCCESS;
    }
}