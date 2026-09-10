<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collaborator extends Model
{
    use HasFactory;

    protected $table = 'collaborators';

    public $timestamps = false;

    protected $fillable = [
        'owner_instructor_id',
        'member_user_id',
        'permission',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function ownerProfile()
    {
        return $this->belongsTo(InstructorProfile::class, 'owner_instructor_id');
    }

    public function memberUser()
    {
        return $this->belongsTo(User::class, 'member_user_id');
    }
}
