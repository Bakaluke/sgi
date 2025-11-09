<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TenantResource\Pages;
use App\Models\Tenant;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use App\Models\Plan;

class TenantResource extends Resource
{
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationLabel = 'Empresas';

    protected static ?string $modelLabel = 'Empresa';

    protected static ?string $pluralModelLabel = 'Empresas';

    protected static ?string $navigationGroup = 'Gerenciamento SaaS';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informações Principais')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Nome de Exibição (Interno)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('plan_id')
                            ->label('Plano')
                            ->options(Plan::all()->pluck('name', 'id'))
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Status da Assinatura')
                            ->options([
                                'active' => 'Ativa',
                                'suspended' => 'Suspensa',
                                'trial' => 'Período de Teste',
                            ])
                            ->required(),
                    ]),
                
                Forms\Components\Section::make('Dados Fiscais e Contato')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('company_fantasy_name')
                            ->label('Nome Fantasia')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('legal_name')
                            ->label('Razão Social')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('cnpj')
                            ->label('CNPJ')
                            ->maxLength(18)
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('email')
                            ->label('E-mail Principal')
                            ->email()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('phone')
                            ->label('Telefone Principal')
                            ->maxLength(20),
                        Forms\Components\TextInput::make('website')
                            ->label('Website')
                            ->url()
                            ->prefix('https://')
                            ->maxLength(255),
                    ]),

                Forms\Components\Section::make('Endereço')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('cep')
                            ->label('CEP')
                            ->maxLength(9),
                        Forms\Components\TextInput::make('street')
                            ->label('Rua / Logradouro')
                            ->maxLength(255)
                            ->columnSpan(2),
                        Forms\Components\TextInput::make('number')
                            ->label('Número')
                            ->maxLength(20),
                        Forms\Components\TextInput::make('complement')
                            ->label('Complemento')
                            ->maxLength(255)
                            ->columnSpan(2),
                        Forms\Components\TextInput::make('neighborhood')
                            ->label('Bairro')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('city')
                            ->label('Cidade')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('state')
                            ->label('UF')
                            ->maxLength(2),
                    ]),

                Forms\Components\FileUpload::make('logo_path')
                    ->label('Logotipo')
                    ->image()
                    ->directory('logos')
                    ->visibility('public'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nome (Interno)')
                    ->searchable(),
                Tables\Columns\TextColumn::make('company_fantasy_name')
                    ->label('Nome Fantasia')
                    ->searchable(),
                Tables\Columns\TextColumn::make('plan.name')
                    ->label('Plano'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'suspended' => 'danger',
                        'trial' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Cliente Desde')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
    
    public static function getRelations(): array
    {
        return [
            //
        ];
    }
    
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTenants::route('/'),
            'create' => Pages\CreateTenant::route('/create'),
            'edit' => Pages\EditTenant::route('/{record}/edit'),
        ];
    }    
}