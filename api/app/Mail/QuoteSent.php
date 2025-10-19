<?php

namespace App\Mail;

use App\Models\Quote;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class QuoteSent extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Quote $quote,
        public string $emailBody
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Seu Orçamento Nº ' . $this->quote->id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.quote-sent',
        );
    }

    public function attachments(): array
    {
        $settings = Setting::first();
        $pdf = Pdf::loadView('pdf.quote', [
            'quote' => $this->quote,
            'customer_data' => $this->quote->customer_data,
            'settings' => $settings
        ]);

        return [
            Attachment::fromData(fn () => $pdf->output(), 'Orcamento-'.$this->quote->id.'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}